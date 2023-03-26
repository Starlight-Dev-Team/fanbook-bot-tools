<script lang="ts" setup>
import { useServiceConfig } from '~~/config';

import { Button, Result, Spin } from '@arco-design/web-vue';

const service = useServiceConfig();

// 无需鉴权
if (!service.auth) await navigateTo('/');

try {
  await service.auth?.getProfile()
  await navigateTo('/'); // 鉴权已通过
} catch {}

type Status = 'loading' | 'failed';
const status = ref('loading' as Status);

try {
  await service.auth?.requestAuth();
  await navigateTo('/');
} catch (err) {
  console.error(err);
  status.value = 'failed';
}
</script>

<template>
  <Spin v-if='status === "loading"' tip='正在请求'></Spin>
  <Result v-else status='error' title='鉴权失败'>
    <template #extra>
      <Button type='primary' @click='() => service.auth?.redirect()'>
        重新授权
      </Button>
    </template>
  </Result>
</template>
