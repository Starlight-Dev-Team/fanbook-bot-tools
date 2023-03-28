<script lang="ts" setup>
import { useServiceConfig } from '~~/config';

import { Button, Result, Spin } from '@arco-design/web-vue';

const service = useServiceConfig();

// 无需鉴权
if (!service.auth) await navigateTo('/');

type Status = 'loading' | 'failed';
const status = ref('loading' as Status);

const msg = ref('');
const errorToMsg: Record<string, string> = {
  'No given code': '授权过期',
  'Access denied: Not in whitelist': '无权限',
};

function doErrorMsg(err: unknown) {
  if (err instanceof Error) {
    msg.value = errorToMsg[err.message] ?? '未知错误';
  }
  console.error(err);
  status.value = 'failed';
}

try {
  await service.auth?.getProfile();
  await navigateTo('/'); // 鉴权已通过
} catch (err) {
  doErrorMsg(err);
}

if (status.value === 'loading') { // 如果上面已经处理过，则此处不执行
  try {
    await service.auth?.requestAuth();
    await service.auth?.getProfile();
    await navigateTo('/');
  } catch (err) {
    doErrorMsg(err);
  }
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
