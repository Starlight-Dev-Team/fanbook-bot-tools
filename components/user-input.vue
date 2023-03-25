<script lang="ts" setup>
import type { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import { getCurrentBot } from '../utils/bot';

export interface Props {
  bot?: Bot;
  guild?: bigint;
  modelValue?: bigint;
}
const props = withDefaults(defineProps<Props>(), {
  bot: () => getCurrentBot(),
});

const emit = defineEmits([
  'update:model-value',
  /** 输入值改变时触发。 */
  'input',
  /** 输入值改变且输入正确时触发。 */
  'change',
  /** 输入值改变且输入错误时触发。 */
  'error',
]);

const input = ref(undefined as number | undefined);

function emitErrorEvent() {
  emit('error', input.value);
}

async function onChange(v: string | undefined) {
  emit('input', v);
  const id = Number(v);
  if (!props.guild || Number.isNaN(id)) { // 用户短 ID 是数值
    emitErrorEvent();
    return;
  }
  try {
    const user = await props.bot.getUserByShortId({
      guild: props.guild,
      id,
    });
    emit('update:model-value', user);
    emit('change', user);
  } catch {
    emitErrorEvent();
  }
}
</script>

<template>
  <NumberInput
    v-model='input'
    @change='onChange'
  >
    <template #prefix>#</template>
  </NumberInput>
</template>
