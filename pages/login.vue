<script lang="ts" setup>
import {
  Avatar,
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Space,
  Textarea,
} from '@arco-design/web-vue';
import {
  IconMore,
  IconQuestionCircleFill,
} from '@arco-design/web-vue/es/icon';

import { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import { back } from '~~/utils/router';

import { addBot, hasBot } from '~~/utils/account';

import { useMainStore } from '~~/stores/main';

interface FormInput {
  token?: string;
}

const form = reactive({} as FormInput);

let bot = shallowRef(undefined as Bot | undefined);
let avatar = ref(undefined as string | undefined);

type Status = 'ready' | 'loading' | 'failed' | 'success';
const status = ref('ready' as Status);

type TokenValidate =
  | 'success'
  | 'error'
  | 'warning'
  | 'validating'
  | undefined
const tokenValidate = ref(undefined as TokenValidate);
watch(status, (value) => { // status 同步到 tokenValidate
  switch (value) {
    case 'success': tokenValidate.value = 'success'; break;
    case 'failed': tokenValidate.value = 'error'; break;
    case 'loading': tokenValidate.value = 'validating'; break;
  }
  tokenValidate.value = value === 'success' ? value : 'error';
});

/** token 长度。 */
const TOKEN_LENGTH = 96;

/**
 * 校验 token ，更新头像信息。
 */
 async function onTokenInput(value: string) {
  if (value.length !== TOKEN_LENGTH) {
    status.value = 'failed';
    return;
  }

  const now = new Bot(value);

  try {
    // 校验并获取头像
    const img = (await now.getProfile()).avatar;
    if (!img) throw new Error('No avatar found');
    // 请求头像地址，这样就有缓存了，图片加载时不会太慢
    await fetch(img, {
      mode: 'no-cors',
    });
    // 更新数据
    avatar.value = img;
    bot.value = now;
    // 在请求完成后才更新状态
    status.value = 'success';
  } catch (err) {
    avatar.value = undefined;
    // status.value = 'failed';
  }
}

function onSubmit() {
  if (status.value !== 'success') {
    Message.error({
      content: '无效的机器人令牌',
      duration: 2000,
    });
    return;
  }
  if (!form.token || hasBot(form.token)) {
    Message.error({
      content: '机器人已存在',
      duration: 2000,
    });
    return;
  }
  // 检测通过
  addBot(form.token as string);
  Message.success({
    content: '添加成功',
    duration: 1000,
    closable: true,
    onClose() {
      useMainStore().needReload = true;
      back();
    }
  });
}
</script>

<template>
  <Space class='show-bar'>
    <Avatar class='avatar' :image-url='avatar'>
      <IconQuestionCircleFill v-if='status !== "success"' />
    </Avatar>
    <IconMore />
    <Avatar class='avatar' image-url='/logo.png' />
  </Space>
  <Form
    class='form'
    :model='form'
    auto-label-width
    @submit='onSubmit'
  >
    <FormItem label='机器人 Token' :validate-status='tokenValidate' feedback>
      <ClientOnly>
        <Input
          v-if='$device === "desktop"'
          autocomplete='current-password'
          v-model='form.token'
          :min-length='TOKEN_LENGTH'
          :max-length='TOKEN_LENGTH'
          @change='onTokenInput'
        />
        <Textarea
          v-else
          autocomplete='current-password'
          v-model='form.token'
          :max-length='TOKEN_LENGTH'
          @change='onTokenInput'
        />
        <template #extra>
          仅保存在本地，不上传到服务端。
        </template>
      </ClientOnly>
    </FormItem>
    <FormItem class='operation'>
      <Button type='primary' html-type='submit'>
        确认添加
      </Button>
    </FormItem>
  </Form>
</template>

<style scoped>
.show-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  user-select: none;
}
.form {
  width: 70vw;
  margin: 0 auto;
}
body.mobile .form {
  width: 90vw;
}
.avatar {
  background: none;
}
.avatar svg {
  color: var(--color-text-2);
  font-size: 32px;
}
.operation {
  margin-top: -12px;
}
</style>
