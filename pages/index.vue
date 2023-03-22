<script lang="tsx" setup>
import { Card, Row, TypographyTitle } from '@arco-design/web-vue';

import {
  IconDelete,
  IconList,
  IconMessage,
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
  <div class='features'>
    <Row v-for='row in features'>
      <Card
        class='feature-box'
        :title='row.title'
      >
        <Card
          v-for='item in row.children'
          class='feature-card' 
          @click='() => $router.push(item.link)'
        >
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
  margin-bottom: 20px;
}
.feature-box:deep() .arco-card-body {
  display: flex;
  flex-wrap: nowrap;
}
.feature-card {
  width: 96px;
  height: 96px;
  margin-right: 20px;
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
