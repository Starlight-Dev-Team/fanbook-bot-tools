<script lang="ts" setup>
import { provide, onActivated, ref } from 'vue';

import { RouterView } from 'vue-router';

import {
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Spin,
} from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import router from '@/router';

import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

const loading = ref(true);

router.beforeEach(() => {
  loading.value = true;
});
router.afterEach(() => {
  loading.value = false;
});

provide('loading', loading);
</script>

<template>
  <Spin :loading='loading' dot>
    <LayoutHeader><Header /></LayoutHeader>
    <LayoutContent><RouterView /></LayoutContent>
    <LayoutFooter><Footer /></LayoutFooter>
  </Spin>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
*::-webkit-scrollbar {
  display: none;
}
#app {
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
</style>
