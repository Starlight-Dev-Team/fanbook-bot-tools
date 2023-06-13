<script lang="ts" setup>
import { FanbookApiError } from '@starlight-dev-team/fanbook-api-sdk/dist/util';

import { BotErrorCode } from '~/utils/bot';

import { SelectedChat } from '~/components/chat-selector.vue';
import FeatureForm from '~/components/feature-form.vue';

const loading = ref(false);
/** 执行中的错误。 */
const errors = reactive(new Map<string, number>()); // Map 需要使用 reactive
/** 发送的消息 ID。 */
const messages: Ref<bigint[]> = ref([]);

export interface Input {
  targets: SelectedChat[];
  content: string;
  unreactive: boolean;
}
const input: Ref<Input> = ref({
  targets: [],
  content: '',
  unreactive: false,
});

/**
 * 发送消息错误转为错误信息。
 * @param e 错误对象
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
async function handleSubmit() {
  messages.value = [];
  const bot = getCurrentBot();
  const text = input.value.content;
  let errorCount = 0;
  loading.value = true;
  for (const { chat } of input.value.targets) {
    try {
      messages.value.push(await bot.sendMessage({
        chat,
        text,
        description: text,
        isUnreactive: input.value.unreactive,
      }));
    } catch (e) {
      const msg = sendErrorToMsg(e);
      if (msg) {
        errors.set(msg, (errors.get(msg) ?? 0) + 1);
      } else {
        const s = String(e);
        errors.set(s, (errors.get(s) ?? 0) + 1);
        console.error(e);
      }
      ++errorCount;
    }
  }
  if (errorCount < input.value.targets.length) modalType.value = 'success';
  else modalType.value = 'error';
  modalOpen.value = true;
  loading.value = false;
}

const modalOpen = ref(false);
const modalType: Ref<'success' | 'error'> = ref('success');
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
      <template v-if='input.targets.length > 1'>
        <ATypographyText>错误列表：</ATypographyText>
        <AList :data='Array.from(errors.keys())' size='small'>
          <template #item='{ item }'>
            <AListItem class='inline-flex justify-between w-full'>
              <ATypographyText>{{ item }}</ATypographyText>
              <ABadge :count='errors.get(item)' />
            </AListItem>
          </template>
        </AList>
      </template>
      <ATypographyText v-else>
        错误原因：{{ Array.from(errors.keys())[0] }}
      </ATypographyText>
    </template>
    <template v-else>
      消息 ID：
      <ATypographyText v-if='messages.length === 1'>{{ messages[0] }}</ATypographyText>
      <AList v-else :data='messages' size='small'>
        <template #item='{ item }'>
          <AListItem class='inline-flex justify-between w-full'>
            <ATypographyText>{{ item }}</ATypographyText>
          </AListItem>
        </template>
      </AList>
    </template>
  </AModal>
  <FeatureForm v-model='input' :loading='loading' submit-text='发送' @submit='handleSubmit'>
    <AFormItem field='targets' label='目标聊天' required :rules='FORM_REQUIRE_RULE'>
      <ChatSelector v-model='input.targets' />
    </AFormItem>
    <AFormItem field='content' label='消息内容' required :rules='FORM_REQUIRE_RULE'>
      <ATextarea class='min-h-[5em]' v-model='input.content' :max-length='10240' auto-size />
    </AFormItem>
    <AFormItem field='unreactive' label='禁止表态' tooltip='开启后，消息无法被表态'>
      <ASwitch v-model='input.unreactive' />
    </AFormItem>
  </FeatureForm>
</template>
