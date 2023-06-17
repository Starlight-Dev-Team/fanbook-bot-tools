<script lang="ts" setup>
export interface Props {
  modelValue: bigint | undefined;
}
export interface Events {
  (event: 'update:modelValue', value: bigint): void;
  /** 输入值改变且输入正确时触发。 */
  (event: 'change', value: bigint): void;
  /** 输入值改变且输入错误时触发。 */
  (event: 'error', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const input: Ref<string> = ref('');
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) input.value = v.toString();
    else input.value = '';
  },
  { immediate: true },
);

function handleChange(v: string) {
  const ans = tryBigintify(v);
  if (ans) {
    emit('update:modelValue', ans);
    emit('change', ans);
  } else {
    emit('error', v);
  }
}

const TYPE = 'number' as unknown as 'text';
</script>

<template>
  <AInput v-model='input' :type='TYPE' @change='handleChange'>
    <template v-for='(item, key) in $slots' #[key]>
      <slot :name='key' />
    </template>
  </AInput>
</template>
