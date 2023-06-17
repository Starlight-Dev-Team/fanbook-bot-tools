<script lang="ts" setup>
import { Input } from '@arco-design/web-vue';

export interface Props {
  /** 当前输入的数值。 */
  modelValue?: number;
}
export interface Events {
  (event: 'update:model-value', value: number): void;
  /** 输入值改变时触发。 */
  (event: 'input', value: string): void;
  /** 输入值改变且输入正确时触发。 */
  (event: 'change', value: number): void;
  /** 输入值改变且输入错误时触发。 */
  (event: 'error', value?: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

/** 是否未输入值。 */
const empty = ref(props.modelValue !== undefined);
/** 输入的值。 */
const input = ref(empty.value ? props.modelValue?.toString() : undefined);
// 输入改变时同步至 empty ，并立即同步一次
watch(input, (v: string | undefined) => {
  empty.value = !v;
}, { immediate: true });

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
