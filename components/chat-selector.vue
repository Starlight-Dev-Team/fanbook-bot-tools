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
  /** 频道所属的服务器 ID 。 */
  guild?: bigint;
  /** 聊天 ID 。 */
  chat: bigint;
}
export interface Props {
  /** 当前选中的聊天。 */
  modelValue: SelectedChat[];
  /** 最大选择数。 */
  max?: number;
  /** ChatSelector 配置。 */
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

/** 添加聊天。 */
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

/** 删除聊天。 */
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
