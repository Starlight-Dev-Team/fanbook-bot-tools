<script lang="ts" setup>
import { provide, ref, watch } from 'vue';
import type { Ref } from 'vue';

import { RouterView } from 'vue-router';
import router from './router';

import {
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Spin,
} from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import '@/style.css';

import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

export type LoadingInjection = Ref<boolean>;

export type DeviceInjection = Ref<'desktop' | 'mobile'>;

const loading: LoadingInjection = ref(true);
router.beforeEach(() => {
  loading.value = true;
});
router.afterEach(() => {
  loading.value = false;
});
provide('loading', loading);

const device: DeviceInjection = ref('desktop');
function onDeviceChange(): void {
  document.body.classList.add(device.value);
}
const mobileRegexp =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/;
if (mobileRegexp.test(navigator.userAgent)) {
  device.value = 'mobile';
}
watch(device, onDeviceChange);
onDeviceChange();
provide('device', device);
</script>

<template>
  <Spin :loading='loading' dot>
    <LayoutHeader><Header /></LayoutHeader>
    <LayoutContent><RouterView /></LayoutContent>
    <LayoutFooter><Footer /></LayoutFooter>
  </Spin>
</template>
