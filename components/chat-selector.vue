<script lang="ts" setup>
import { ref } from 'vue';

import {
  Button,
  Tag,
  Space,
} from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

import { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import { selectChat } from '~~/utils/biz/select-chat';
import type {
  SelectChatConfig,
} from '~~/utils/biz/select-chat';

import { useAccountStore } from '@/stores/account';

export interface SelectedChat {
  guild?: bigint;
  chat: bigint;
}
export interface Props {
  modelValue: SelectedChat[];
  max?: number;
  selector?: SelectChatConfig;
}

const props = withDefaults(defineProps<Props>(), {
  max: Infinity,
  selector: () => ({
    bot: new Bot(useAccountStore().activeBotToken as string),
  }),
});

const input = ref(props.modelValue);

const bot = new Bot(useAccountStore().activeBotToken as string);

async function add() {
  const res = await selectChat({
    bot,
  });
  if (!res.chat.length) return;
  for (const item of res.chat) {
    input.value.push({
      guild: res.guild,
      chat: item,
    });
  }
}

function remove(index: number) {
  input.value.splice(index, 1);
}
</script>

<template>
  <Space>
    <Button
      v-if='input.length < props.max'
      type='secondary'
      shape='circle'
      @click='add'
    >
      <template #icon>
        <IconPlus />
      </template>
    </Button>
    <Tag
      v-for='(chat, index) in input'
      :key='String(chat.chat)'
      closable
      @close='() => remove(index)'
    >
      {{ chat.chat }}
    </Tag>
  </Space>
</template>
