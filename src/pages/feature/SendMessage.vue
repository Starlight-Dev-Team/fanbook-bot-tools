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

import { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import ChatSelector from '@/components/ChatSelector.vue';

import { useAccountStore } from '@/stores/account';

interface Input {
  targets: bigint[];
  content: string;
}
const input = reactive({
  targets: [],
  content: '',
} as Input);

const REQUEIRE_RULE: FieldRule = {
  required: true,
  message: '本项必填',
};

type Status = 'default' | 'loading';
const status = ref('default' as Status);

const bot = new Bot(useAccountStore().activeBotToken);

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
    for (const chat of input.targets) { // 逐个发送
      await bot.sendMessage({
        chat,
        text: input.content,
        description: input.content,
      });
    }
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
      <FormItem label='消息接收者' field='targets' :rules='REQUEIRE_RULE'>
        <ChatSelector v-model='input.targets' />
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
