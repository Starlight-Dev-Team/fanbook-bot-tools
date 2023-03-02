<script lang="ts" setup>
import { h, reactive, ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Message,
  Modal,
  Spin,
  Textarea,
  TypographyText,
} from '@arco-design/web-vue';
import type { FieldRule } from '@arco-design/web-vue';

import { selectChat } from '@/utils/biz/select-chat';
import { Bot } from '@starlight-dev-team/fanbook-api-sdk';
import { useAccountStore } from '@/stores/account';

interface Input {
  target: bigint;
  content: string;
}
const input = reactive({} as Input);

const REQUEIRE_RULE: FieldRule = {
  required: true,
  message: '本项必填',
};

type Status = 'default' | 'loading';
const status = ref('default' as Status);

const bot = new Bot(useAccountStore().activeBotToken);

async function selectTarget() {
  const res = await selectChat({
    bot,
  });
  if (!res.chat) return;
  const chat = res.chat[0];
  input.target = chat;
}

/**
 * 询问用户是否确定发送**非纯文本内容**。
 * @returns 是否确定
 */
function warnNonPlain(): Promise<boolean> {
  return new Promise((resolve) => {
    Modal.warning({
      title: '内容格式提示',
      content: () => h(
        'div',
        null,
        [
          '消息内容解析为',
          h(TypographyText, { bold: true }, ['非纯文本']),
          '！',
        ]
      ),
      hideCancel: false,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

async function onSubmit() {
  let json = undefined;
  try { // 判断是否非纯文本
    json = JSON.parse(input.content);
  } catch {}
  if (json !== undefined) { // 非纯文本
    if (!await warnNonPlain()) return; // 用户取消操作
  }
  status.value = 'loading';
  try {
    await bot.sendMessage({
      chat: input.target,
      text: input.content,
      description: input.content,
    });
    Message.success({
      content: '发送成功',
      duration: 2500,
    });
  } catch (err) {
    Message.error({
      content: '发送失败',
      duration: 6000,
    });
  }
  status.value = 'default';
}
</script>

<template>
  <Spin class='form-wrapper' :loading='status === "loading"' tip='正在执行'>
    <Form
      class='form'
      :model='input'
      :disabled='status === "loading"'
      auto-label-width
      @submit-success='onSubmit'
    >
      <FormItem label='消息接收者' field='target' :rules='REQUEIRE_RULE'>
        <Button type='secondary' @click='selectTarget'>选择聊天</Button>
        <TypographyText v-if='input.target'>
          当前选择：{{ input.target }}
        </TypographyText>
      </FormItem>
      <FormItem label='消息内容' field='content' :rules='REQUEIRE_RULE'>
        <Textarea v-model='input.content' allow-clear :auto-size='{
          minRows: 5,
        }' :max-length='10240' />
      </FormItem>
      <FormItem>
        <Button type='primary' html-type='submit'>
          发送消息
        </Button>
      </FormItem>
    </Form>
  </Spin>
</template>

<style scoped>
.form-wrapper {
  display: block;
  width: 70%;
  margin: 0 auto;
}
.form {
  width: 100%;
}
</style>
