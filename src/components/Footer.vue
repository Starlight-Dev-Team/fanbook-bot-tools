<script lang="ts" setup>
import { inject } from 'vue';

import {
  Divider,
  TypographyText,
} from '@arco-design/web-vue';
import Link from './Link.vue';
import type { DeviceInjection } from '@/App.vue';

export interface FooterItem {
  label: string;
  link: string;
}
const data: FooterItem[] = [{
  label: 'Fanbook 开放平台',
  link: 'https://open.fanbook.mobi/',
}, {
  label: '代码仓库',
  link: 'https://github.com/Starlight-Dev-Team/fanbook-bot-tools',
}, {
  label: '关于',
  link: '/about',
}, {
  label: '版本信息',
  link: '/version',
}];

const $device = inject('device') as DeviceInjection;
</script>

<template>
  <TypographyText>
    <TypographyText v-for='(item, index) in data'>
      <Divider v-if='!!index' direction='vertical' />
      <Link :to='item.link'>
        {{ item.label }}
      </Link>
    </TypographyText>
  </TypographyText>
  <TypographyText>
    Released under
    <Link to='https://opensource.org/license/mit/' :hoverable='false'>
      MIT License
    </Link>
    <template v-if='$device === "desktop"'>,</template>
    <template v-else><br /></template>
    Copyright &copy; 2023 星光工作室
  </TypographyText>
</template>

<style scoped>
span.arco-typography:deep() {
  text-align: center;
}
</style>
