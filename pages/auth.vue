<script lang="ts" setup>
import { useServiceConfig } from '~~/config';

import { Button, Result, Spin } from '@arco-design/web-vue';

const service = useServiceConfig();
debugger
// 无需鉴权
if (!service.auth) await navigateTo('/');

try {
  await service.auth?.getProfile();
  await navigateTo('/'); // 鉴权已通过
} catch {}

type Status = 'loading' | 'failed';
const status = ref('loading' as Status);

const msg = ref('');
const errorToMsg: Record<string, string> = {
  'No given code': '授权过期',
};

try {
  await service.auth?.requestAuth();
  await navigateTo('/');
} catch (err) {
  if (err instanceof Error) {
    msg.value = errorToMsg[err.message] ?? '未知错误';
  }
  console.error(err);
  status.value = 'failed';
}
</script>

<template>
  <Spin v-if='status === "loading"' tip='正在请求'></Spin>
  <Result v-else status='error' :title='`鉴权失败：${msg}`'>
    <template #extra>
      <Button type='primary' @click='() => service.auth?.redirect()'>
        重新授权
      </Button>
    </template>
  </Result>
</template>
