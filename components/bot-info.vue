<script lang="ts" setup>
import {
  Avatar,
  Skeleton,
  SkeletonLine,
  SkeletonShape,
  Space,
  TypographyText,
} from '@arco-design/web-vue';

import type { Profile } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

export interface Props {
  /**
   * 显示的机器人资料信息。
   *
   * 为空时显示加载中效果。
   */
  profile?: Profile;
}
defineProps<Props>();
</script>

<template>
  <Space v-bind='$attrs'>
    <template v-if='!profile'>
      <Skeleton class='skeleton' animation>
        <SkeletonShape class='bot-avatar' shape='circle' size='small' />
        <SkeletonLine :rows='1' />
      </Skeleton>
    </template>
    <template v-else>
      <Avatar class='bot-avatar' :image-url='profile.avatar' />
      <TypographyText>{{ profile.name }}</TypographyText>
    </template>
  </Space>
</template>

<style scoped>
.skeleton {
  display: inline-flex;
  flex-wrap: nowrap;
  margin-top: 4px;
  height: 8px;
}
.skeleton:deep() .arco-skeleton-shape {
  margin-top: -2px;
  margin-right: 4px;
}
.skeleton:deep() .arco-skeleton-line {
  margin-top: 6px;
  width: 100px;
}
.bot-avatar {
  display: inline-flex;
  background: none;
}
</style>
