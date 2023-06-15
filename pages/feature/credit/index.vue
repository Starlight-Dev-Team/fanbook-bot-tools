<script lang="ts" setup>
import type { GuildCredit } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

definePageMeta({
  title: '荣誉卡槽',
  requiredAuth: true,
});

export interface Input {
  credit: GuildCredit;
}
const input: Ref<Input> = ref({
  credit: {
    id: 'x'.repeat(20),
    authority: {
      icon: 'https://fb-cdn.fanbook.mobi/fanbook/app/files/chatroom/image/8af6a892e4143284cac9f719e99ee0a9.png',
      name: '机器人工具',
    },
    title: {
      icon: 'icon',
    },
    slots: [[{
      image: 'https://fb-cdn.fanbook.mobi/fanbook/app/files/chatroom/image/b7986a4941f3e49866b30fd2cc8f413e.png',
      value: 'Hello, World!',
    }]],
  },
});
</script>

<template>
  <FeatureForm v-model='input'>
    <AFormItem class='w-full' field='credit'>
      <Credit class='w-full' v-model='input.credit' editable />
    </AFormItem>
  </FeatureForm>
</template>
