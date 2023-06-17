<script lang="ts" setup>
import {
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import { checkAuth } from './middleware/guard.global';
checkAuth(useRoute());
</script>

<template>
  <Teleport to='head'>
    <title>Fanbook 机器人工具</title>
  </Teleport>
  <LayoutHeader>
    <NuxtLayout name='header' />
  </LayoutHeader>
  <LayoutContent>
    <NuxtPage />
  </LayoutContent>
  <LayoutFooter>
    <NuxtLayout name='footer' />
  </LayoutFooter>
</template>

<style lang="postcss">
* {
  @apply m-0 p-0;
}
*::-webkit-scrollbar {
  @apply hidden;
}
#__nuxt {
  @apply flex flex-col;
  @apply min-h-[100vh];
}
header, footer {
  @apply select-none;
}
footer {
  @apply flex flex-col justify-center self-baseline;
  @apply w-full;
  @apply mb-2;
}
.arco-typography b {
  @apply font-bold;
}
body.mobile .arco-modal.arco-modal-simple {
  @apply max-w-[75vw];
}
body.mobile .arco-modal:not(.arco-modal-simple) {
  @apply max-w-[90vw];
}
main {
  @apply w-8/12;
  @apply mx-auto my-0;
}
body.mobile main {
  @apply w-10/12;
}
</style>
