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
export interface Events {
  (event: 'update:modelValue', value: SelectedChat[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  max: Infinity,
  selector: () => ({
    bot: new Bot(useAccountStore().activeBotToken as string),
  }),
});
const emit = defineEmits<Events>();

const bot = new Bot(useAccountStore().activeBotToken as string);

/** 添加聊天。 */
async function add() {
  const input = [...props.modelValue];
  const res = await selectChat({ bot });
  if (!res.chat.length) return;
  for (const item of res.chat) {
    input.push({
      guild: res.guild,
      chat: item,
    });
  }
  emit('update:modelValue', input);
}

/** 删除聊天。 */
function remove(index: number) {
  const input = [...props.modelValue];
  input.splice(index, 1);
  emit('update:modelValue', input);
}
</script>

<template>
  <Space>
    <Button v-if='modelValue.length < props.max' shape='circle' @click='add'>
      <template #icon>
        <IconPlus />
      </template>
    </Button>
    <Tag
      v-for='(chat, index) in modelValue'
      :key='chat.chat.toString()'
      closable
      @close='() => remove(index)'
    >
      {{ chat.chat }}
    </Tag>
  </Space>
</template>
