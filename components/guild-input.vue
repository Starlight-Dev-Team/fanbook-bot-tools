<script lang="ts" setup>
export interface Props {
  /** 当前输入的服务器 ID 。 */
  modelValue: bigint | undefined;
}
export interface Events {
  (event: 'update:modelValue', value: bigint): void;
  /** 输入值改变且输入正确时触发。 */
  (event: 'change', value: bigint): void;
  /** 输入值改变且输入错误时触发。 */
  (event: 'error', value: bigint): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const input: Ref<bigint | undefined> = ref(undefined);
watch(
  () => props.modelValue,
  (v) => input.value = v,
  { immediate: true },
);

function handleChange(v: bigint) {
  if (v.toString().length === 18) { // 服务器 ID 长度为 18
    emit('update:modelValue', v);
    emit('change', v);
  } else {
    emit('error', v);
    emit('update:modelValue', v);
  }
}
</script>

<template>
  <BigintInput
    v-model='input'
    @change='handleChange'
    @error='(v) => $emit("error", v)'
  />
</template>
