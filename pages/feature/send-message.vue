<script lang="ts" setup>
import { FanbookApiError } from '@starlight-dev-team/fanbook-api-sdk/dist/util';

import { BotErrorCode } from '~/utils/bot';

import type { SelectedChat } from '~/components/chat-selector.vue';

import FeatureForm from '~/components/feature-form.vue';

definePageMeta({
  title: '发送消息',
  requiredAuth: true,
});

const bot = getCurrentBot();
const loading = ref(false);

export interface Input {
  targets: SelectedChat[];
  content: string;
  unreactive: boolean;
  toPrivateChats: boolean;
}
const input: Ref<Input> = ref({
  targets: [],
  content: '',
  unreactive: false,
  toPrivateChats: false,
});

/**
 * 发送消息错误转为错误信息。
 * @param e 错误对象
 * @returns 错误信息，无则为 `undefined`
 */
function sendErrorToMsg(e: unknown): string | undefined {
  if (e instanceof FanbookApiError) {
    const res = e.response as any;
    const code = res?.data?.error_code;
    const desc = res?.data?.description;
    if (code || desc) return BotErrorCode[code] ?? desc;
    if (res.code === 'ERR_NETWORK') return '无权限发送消息';
  }
  return undefined;
}

interface SendOptions {
  chat: bigint;
  content: string;
  unreactive: boolean;
}
/**
 * 发送消息。
 * @returns 成功则为消息 ID，失败则为原因
 */
async function send({ chat, content, unreactive }: SendOptions): Promise<bigint | string> {
  try {
    return await bot.sendMessage({ // 直接返回消息 ID
      chat,
      text: content,
      description: content,
      isUnreactive: unreactive,
    });
  } catch (e) { // 需要返回错误原因
    const msg = sendErrorToMsg(e);
    if (msg) return msg; // 已知错误
    return String(e); // 未知错误
  }
}

interface BatchSendOptions extends Omit<SendOptions, 'chat'> {
  chats: bigint[];
  onBeforeSend?: () => any;
}
interface BatchSendReturn {
  messages: bigint[];
  errors: Map<string, number>;
  errorCount: number;
}
/**
 * 批量发送消息，支持自定义聊天 ID 数组，其他。
 * @param chats 聊天 ID 数组
 * @returns 消息 ID、失败原因、失败数量
 */
async function batchSend({ chats, content, unreactive, onBeforeSend }: BatchSendOptions): Promise<BatchSendReturn> {
  const messages: bigint[] = [];
  const errors = new Map<string, number>();
  let count = 0;
  for (const chat of chats) {
    if (onBeforeSend) onBeforeSend();
    const res = await send({ chat, content, unreactive });
    if (typeof res === 'string') { // 发送失败
      errors.set(res, (errors.get(res) ?? 0) + 1); // 此原因自增 1
      ++count;
    } else { // 发送成功
      messages.push(res); // 推进消息 ID 数组
    }
  }
  return { messages, errors, errorCount: count };
}

/** 任务总数。 */
const total = ref(0);
/** 当前发送的消息序号。 */
const current = ref(0);
/** 执行中的错误。 */
const errors = reactive(new Map<string, number>()); // Map 需要使用 reactive
/** 发送的消息 ID。 */
const messages: Ref<bigint[]> = ref([]);
/** 弹窗状态。 */
const modalOpen = ref(false);
/** 弹窗图标。 */
const modalType: Ref<'success' | 'error'> = ref('success');

async function sendAs1By1(): Promise<{ errorCount: number }> {
  debugger
  const users = new Map<bigint, boolean>();
  const STEP = 30;
  const { content, unreactive } = input.value;
  let count = 0;
  for (const { guild, chat } of input.value.targets) {
    if (!guild) continue;
    let members: bigint[];
    let start = 1, end = STEP;
    do {
      members = await bot.getChannelMembers({ // 获取成员列表
        guild,
        channel: chat,
        range: { start, end },
      });
      start += STEP;
      end += STEP;
      const chats: bigint[] = [];
      members = members.filter((v) => !users.get(v)); // 过滤已经发过的
      for (const target of members) { // 转私聊
        users.set(target, true); // 标记为发过了
        chats.push(await bot.getPrivateChat({ target }));
      }
      total.value += chats.length; // 记录消息数
      const res = await batchSend({ // 发送
        chats,
        content,
        unreactive,
        onBeforeSend: () => ++current.value,
      });
      messages.value.push(...res.messages); // 记录消息 ID
      for (const [k, v] of res.errors) { // 记录错误
        errors.set(k, (errors.get(k) ?? 0) + v);
        ++count;
      }
    } while (members.length);
    total.value += members.length;
  }
  return {
    errorCount: count,
  }
}

async function handleSubmit() {
  loading.value = true;
  current.value = 0;
  errors.clear();
  let errorCount: number;
  if (input.value.toPrivateChats) { // 逐个通知成员
    errorCount = (await sendAs1By1()).errorCount;
  } else { // 普通消息
    const chats: bigint[] = input.value.targets.map((v) => v.chat); // 只留下聊天 ID
    total.value = chats.length;
    const res = await batchSend({ // 执行批量任务
      chats,
      content: input.value.content,
      unreactive: input.value.unreactive,
      onBeforeSend: () => ++current.value,
    });
    // 复制到全局变量
    messages.value = res.messages;
    for (const [k, v] of res.errors) errors.set(k, v); // reactive 不能直接赋值，需要逐个替换
    errorCount = res.errorCount;
  }
  // UI 逻辑
  if (errorCount >= total.value) modalType.value = 'error'; // 全部失败
  else modalType.value = 'success'; // 不全部失败，视为成功
  modalOpen.value = true;
  loading.value = false;
}
</script>

<template>
  <AModal
    v-model:visible='modalOpen'
    :title='modalType === "success" ? "发送成功" : "发送失败"'
    :message-type='modalType'
    :esc-to-close='false'
    simple
    unmount-on-close
    hide-cancel
    @close='() => errors.clear()'
  >
    <template v-if='errors.size'>
      <template v-if='total > 1'>
        <ATypographyParagraph>
          共 {{ total }} 条消息，其中 {{ total - messages.length }} 条发送失败。
        </ATypographyParagraph>
        <AList :data='Array.from(errors.keys())' size='small'>
          <template #header>
            <ATypographyText class='font-bold'>失败原因</ATypographyText>
          </template>
          <template #item='{ item }'>
            <AListItem>
              <ATypographyText>{{ item }}</ATypographyText>
              <template #actions>
                <ABadge :count='errors.get(item)' />
              </template>
            </AListItem>
          </template>
        </AList>
      </template>
      <ATypographyText v-else>
        失败原因：{{ Array.from(errors.keys())[0] }}
      </ATypographyText>
    </template>
    <template v-else>
      <ATypographyText v-if='messages.length === 1'>消息 ID：{{ messages[0] }}</ATypographyText>
      <AList v-else :data='messages' size='small' :pagination-props='{
        pageSize: 5,
        total: messages.length,
      }'>
        <template #header>
          <ATypographyText class='font-bold'>消息 ID</ATypographyText>
        </template>
        <template #item='{ item }'>
          <AListItem class='inline-flex justify-between w-full'>
            <ATypographyText>{{ item }}</ATypographyText>
          </AListItem>
        </template>
      </AList>
    </template>
  </AModal>
  <FeatureForm v-model='input' :loading='loading' :loading-text='`正在发送第 ${current} 条消息`' submit-text='发送' @submit='handleSubmit'>
    <AFormItem field='targets' label='目标聊天' required :rules='FORM_REQUIRE_RULE'>
      <ChatSelector v-model='input.targets' />
    </AFormItem>
    <AFormItem field='content' label='消息内容' required :rules='FORM_REQUIRE_RULE'>
      <ATextarea class='min-h-[5em]' v-model='input.content' :max-length='10240' auto-size />
    </AFormItem>
    <AFormItem field='unreactive' label='禁止表态' tooltip='开启后，消息无法被表态'>
      <ASwitch v-model='input.unreactive' />
    </AFormItem>
    <AFormItem field='toPrivateChats' label='逐个通知成员' tooltip='开启后，消息将私信发送给聊天内所有成员'>
      <ASwitch v-model='input.toPrivateChats' />
    </AFormItem>
  </FeatureForm>
</template>
