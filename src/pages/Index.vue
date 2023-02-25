<script lang="ts" setup>
import { h } from 'vue';
import type { VNode } from 'vue';

import { Card, Col, Row, TypographyTitle } from '@arco-design/web-vue';

import Link from '@/components/Link.vue';
import { IconMessage } from '@arco-design/web-vue/es/icon';

/** 功能卡片数据。 */
export interface Feature {
  /** 卡片图标。 */
  icon: VNode;
  /** 卡片内容。 */
  content: string;
  /** 卡片右上角链接。 */
  link: string;
}

/**
 * 功能入口列表。
 */
const features: Array<{
  /** 分类标题。 */
  title: string;
  /** 分类图标。 */
  icon: VNode;
  /** 分类下属功能卡片数据。 */
  children: Feature[];
}> = [
   {
    title: '机器人消息',
    icon: h(IconMessage),
    children: [{
      icon: h(IconMessage, { size: 36 }),
      content: '发送消息',
      link: 'feature/send-message',
    }],
  },
];
</script>

<template>
  <div class='features'>
    <Row v-for='row in features'>
      <Card
        v-for='item in row.children'
        class='feature-box'
        :title='row.title'
        @click='() => $router.push(item.link)'
      >
        <Card class='feature-card'>
          <span>
            <component :is='item.icon' />
          </span>
          <p class='feature-content'>
            {{ item.content }}
          </p>
        </Card>
        <template #title>
          <TypographyTitle class='feature-box-title' :heading='2'>
            <component :is='row.icon' />
            {{ row.title }}
          </TypographyTitle>
        </template>
      </Card>
    </Row>
  </div>
</template>

<style scoped>
.features {
  width: 90%;
  margin: 0 auto;
}
.feature-box {
  width: 100%;
}
.feature-card {
  width: 96px;
  height: 96px;
  cursor: pointer;
}
.feature-card:deep() > .arco-card-body {
  display: flex;
  width: 64px;
  height: 64px;
  flex-direction: column;
  align-items: center;
}
.feature-content {
  margin-bottom: 4px;
  margin-top: auto;
}
.feature-box-title {
  width: 100%;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
</style>
