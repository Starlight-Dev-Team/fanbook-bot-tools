<script lang="ts" setup>
import type { AnnouncementType } from '~~/app.config';

import { Alert, Tag, TypographyText } from '@arco-design/web-vue';

function getLocalClosed(): string[] {
  try {
    const given = localStorage.getItem('announcements');
    if (!given) throw new Error('[catched]');
    const result = JSON.parse(given);
    if (!(result instanceof Array)) throw new Error('[catched]');
    return result;
  } catch {
    localStorage.setItem('announcements', '[]');
    return [];
  }
}

const closed = getLocalClosed();
const info = useAppConfig().announcements.filter(
  (v) => !closed.includes(v.title),
);

const current = ref(0);

type AlertType = 'info' | 'error';
function toAlertType(type: AnnouncementType): AlertType {
  switch (type) {
    case 'danger': return 'error';
    default: return type;
  }
}

type TagColor = '#165dff' | '#eb0aa4';
function toTagColor(type: AnnouncementType): TagColor {
  switch (type) {
    case 'danger': return '#eb0aa4';
    case 'info': return '#165dff';
  }
}

function onClose(key: number) {
  localStorage.setItem(
    'announcements',
    JSON.stringify(getLocalClosed().concat(info[key].title)),
  );
}
</script>

<template>
  <template v-if='info.length'>
    <Alert
      v-for='(item, key) in info'
      v-show='key === current'
      class='alert-item'
      :key='key'
      :type='toAlertType(item.type)'
      :show-icon='false'
      closable
      @close='() => onClose(key)'
    >
      <Tag class='tag' :color='toTagColor(item.type)'>公告</Tag>
      <TypographyText bold>{{ item.title }} 👉</TypographyText>
      <AppLink :to='item.link'>
        点击查看
      </AppLink>
    </Alert>
  </template>
</template>

<style scoped>
.alert-item {
  justify-content: center;
}
.alert-item:deep() > .arco-alert-body {
  flex: unset;
}
.tag {
  margin-right: 8px;
}
</style>
