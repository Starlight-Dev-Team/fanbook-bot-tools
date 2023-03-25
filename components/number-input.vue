<script lang="ts" setup>
import { Input } from '@arco-design/web-vue';

export interface Props {
  modelValue?: number;
}
const props = defineProps<Props>();

const emit = defineEmits(['update:model-value', 'input', 'change', 'error']);

const empty = ref(props.modelValue !== undefined);
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
  const numberic = Number(v);
  if (Number.isNaN(numberic)) { // 非数值
    emitErrorEvent();
  } else {
    emit('change', numberic);
  }
}
</script>

<template>
  <Input
    v-bind='$attrs'
    :model-value='empty ? "" : String(input)'
    @input='onInput'
    @change='onChange'
  >
    <template v-for='(item, key) in $slots' v-slot:[key]>
      <slot :name='key' />
    </template>
  </Input>
</template>
