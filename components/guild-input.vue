<script lang="ts" setup>
export interface Props {
  modelValue?: bigint;
}
defineProps<Props>();

const emit = defineEmits(['update:model-value', 'change', 'error']);

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
