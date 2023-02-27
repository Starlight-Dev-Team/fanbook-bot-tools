<script lang="ts" setup>
import { RouterView } from 'vue-router';

import {
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
</script>

<template>
  <LayoutHeader><Header /></LayoutHeader>
  <LayoutContent><RouterView /></LayoutContent>
  <LayoutFooter><Footer /></LayoutFooter>
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
