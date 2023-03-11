<script lang="ts" setup>
import {
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
</script>

<template>
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

<style>
* {
  margin: 0;
  padding: 0;
}
*::-webkit-scrollbar {
  display: none;
}

#__nuxt {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}
header, footer {
  user-select: none;
}
footer {
  display: flex;
  width: 100vw;
  margin-bottom: 8px !important;
  align-self: baseline;
  flex-direction: column;
  justify-content: center;
}

.arco-typography b {
  font-weight: bold;
}
body.mobile .arco-modal.arco-modal-simple {
  max-width: 75vw;
}
body.mobile .arco-modal:not(.arco-modal-simple) {
  max-width: 90vw;
}
</style>
