<script lang="ts" setup>
import { Input } from '@arco-design/web-vue';

export interface Props {
  modelValue?: bigint;
}
const props = defineProps<Props>();

const emit = defineEmits(['update:model-value', 'input', 'change', 'error']);

const empty = ref(props.modelValue === undefined);
const input = ref(empty.value ? props.modelValue?.toString() : undefined);
function onInputChange(v: string | undefined) {
  empty.value = !v;
}
onInputChange(input.value);
watch(input, onInputChange);

function emitErrorEvent() {
  emit('error', input.value);
}

function onInput(v: string) {
  input.value = v;
  emit('input', v);
}
function onChange(v: string) {
  try {
    const numberic = BigInt(v);
    emit('change', numberic);
  } catch { // 非数值
    emitErrorEvent();
  }
}
</script>

<template>
  <Input
    v-bind='$attrs'
    :model-value='empty ? "" : input?.toString()'
    @input='onInput'
    @change='onChange'
  >
    <template v-for='(item, key) in $slots' v-slot:[key]>
      <slot :name='key' />
    </template>
  </Input>
</template>
