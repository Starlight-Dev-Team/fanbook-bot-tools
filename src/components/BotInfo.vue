<script lang="ts" setup>
import { Avatar, Space, TypographyText } from '@arco-design/web-vue';

import type { Profile } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

export interface Props {
  /**
   * 显示的机器人资料信息。
   */
  profile: Profile;
}
defineProps<Props>();
</script>

<template>
  <Space>
    <Avatar class='bot-avatar' :image-url='profile.avatar' />
    <TypographyText>{{ profile.name }}</TypographyText>
  </Space>
</template>

<style scoped>
.bot-avatar {
  display: inline;
  background: none;
}
</style>
