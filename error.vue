<script lang="ts" setup>
import { Button, Result } from '@arco-design/web-vue';

export interface Props {
  error?: unknown;
}
const props = defineProps<Props>();

type Type = undefined | '404';
const type = ref(undefined as Type);
switch (typeof props.error) {
  case 'undefined':
  case 'string':
  case 'object': { // 是 Nuxt 错误
    if (props.error !== null && isNuxtError(props.error)) {
      // 404
      if (props.error.statusCode === 404) type.value = '404';
    }
  }
}

async function handleReportError() {
  await navigateTo('https://github.com/Starlight-Dev-Team/fanbook-bot-tools/issues', {
    external: true,
  });
}

console.error(props.error);
</script>

<template>
  <Result status='error' title='未知错误' v-if='!type'>
    <template #extra>
      <Button type='primary' @click='() => navigateTo("/")'>返回首页</Button>
      <Button @click='handleReportError'>报告错误</Button>
    </template>
  </Result>
  <Page404 v-else-if='type === "404"' />
</template>
