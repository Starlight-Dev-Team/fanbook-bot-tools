<script lang="ts" setup>
import { Input } from '@arco-design/web-vue';

export interface Props {
  /** 当前输入的数值。 */
  modelValue?: number;
}
const props = defineProps<Props>();

const emit = defineEmits([
  'update:model-value',
  /** 输入值改变时触发。 */
  'input',
  /** 输入值改变且输入正确时触发。 */
  'change',
  /** 输入值改变且输入错误时触发。 */
  'error',
]);

/** 是否未输入值。 */
const empty = ref(props.modelValue !== undefined);
/** 输入的值。 */
const input = ref(empty.value ? props.modelValue?.toString() : undefined);
// 输入改变时同步至 empty ，并立即同步一次
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
