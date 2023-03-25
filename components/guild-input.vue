<script lang="ts" setup>
export interface Props {
  /** 当前输入的服务器 ID 。 */
  modelValue?: bigint;
}
defineProps<Props>();

const emit = defineEmits([
  'update:model-value',
  /** 输入值改变且输入正确时触发。 */
  'change',
  /** 输入值改变且输入错误时触发。 */
  'error',
]);

const input = ref(undefined as bigint | undefined);

function emitErrorEvent() {
  emit('error', input.value);
}

function onChange(v: bigint) {
  input.value = v;
  if (v.toString().length !== 18) { // 服务器 ID 长度为 18
    emitErrorEvent();
    return;
  }
  emit('change', v);
  emit('update:model-value', v);
}
</script>

<template>
  <BigintInput
    v-model='input'
    @change='onChange'
    @error='emitErrorEvent'
  />
</template>
