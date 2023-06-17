<script lang="tsx" setup>
import { Card, Row, TypographyTitle } from '@arco-design/web-vue';

import {
  IconDelete,
  IconList,
  IconMessage,
  IconRobot,
  IconStar,
} from '@arco-design/web-vue/es/icon';

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
    title: '机器人',
    icon: <IconRobot size={18} />,
    children: [{
      icon: <IconRobot size={36} />,
      content: '资料信息',
      link: 'feature/get-bot-info',
    }],
  },
  {
    title: '机器人消息',
    icon: <IconMessage />,
    children: [{
      icon: <IconMessage size={36} />,
      content: '发送消息',
      link: 'feature/send-message',
    }],
  },
  {
    title: '荣誉卡槽',
    icon: <IconStar />,
    children: [{
      icon: <IconStar size={36} />,
      content: '设置荣誉',
      link: 'feature/set-credit',
    }, {
      icon: <IconDelete size={36} />,
      content: '删除荣誉',
      link: 'feature/delete-credit',
    }, {
      icon: <IconList size={36} />,
      content: '荣誉列表',
      link: 'feature/get-user-credit',
    }],
  },
];
</script>

<template>
  <Row v-for='row in features'>
    <Card class='w-full mb-5' :title='row.title'>
      <Card
        v-for='item in row.children'
        class='card inline-flex w-24 h-24 mr-4 cursor-pointer'
        @click='() => $router.push(item.link)'
      >
        <component :is='item.icon' />
        <p class='mb-1 mt-auto'>{{ item.content }}</p>
      </Card>
      <template #title>
        <TypographyTitle class='w-full m-0 text-lg font-bold' :heading='2'>
          <component :is='row.icon' />
          {{ row.title }}
        </TypographyTitle>
      </template>
    </Card>
  </Row>
</template>

<style lang="postcss" scoped>
.card:deep() > .arco-card-body {
  @apply w-full h-full;
  @apply inline-flex;
  @apply items-center;
  @apply flex-col;
}
</style>
