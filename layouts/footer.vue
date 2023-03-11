<script lang="ts" setup>
import {
  Divider,
  TypographyText,
} from '@arco-design/web-vue';

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
</script>

<template>
  <TypographyText>
    <TypographyText v-for='(item, index) in data'>
      <Divider v-if='!!index' direction='vertical' />
      <AppLink :to='item.link'>
        {{ item.label }}
      </AppLink>
    </TypographyText>
  </TypographyText>
  <TypographyText>
    Released under
    <AppLink to='https://opensource.org/license/mit/' :hoverable='false'>
      MIT License
    </AppLink>
    <ClientOnly>
      <template v-if='$device === "desktop"'>,</template>
      <template v-else><br /></template>
    </ClientOnly>
    Copyright &copy; 2023 星光工作室
  </TypographyText>
</template>

<style scoped>
span.arco-typography:deep() {
  text-align: center;
}
</style>
