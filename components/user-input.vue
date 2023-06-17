<script lang="ts" setup>
import type { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import { getCurrentBot } from '../utils/bot';

export interface Props {
  bot?: Bot;
  guild: bigint | undefined;
  user: number | undefined;
}
export interface Events {
  (event: 'update:user', value: number): void;
  /** 输入值改变时触发。 */
  (event: 'input', value?: string): void;
  /** 输入值改变且输入正确时触发。 */
  (event: 'change', value: bigint): void;
  /** 输入值改变且输入错误时触发。 */
  (event: 'error', value?: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  bot: () => getCurrentBot(),
});
const emit = defineEmits<Events>();

const input: Ref<number | undefined> = ref();
watch(
  () => props.user,
  (v) => { input.value = v; handleChange(v) }, // props 传入的也要转换后 emit 出去
  { immediate: true },
);

function handleError() {
  emit('error', input.value);
}

async function handleChange(v?: number) {
  const id = Number(v);
  if (!props.guild || Number.isNaN(id)) { // 用户短 ID 是数值
    handleError();
    return;
  }
  try {
    emit('update:user', id);
    emit('change', await props.bot.getUserByShortId({
      guild: props.guild,
      id,
    }));
  } catch {
    handleChange();
  }
}
</script>

<template>
  <AInputNumber
    v-model='input'
    :precision='0'
    :min='0'
    hide-button
    @input='(v) => $emit("input", v)'
    @change='handleChange'
  >
    <template #prefix>#</template>
  </AInputNumber>
</template>
