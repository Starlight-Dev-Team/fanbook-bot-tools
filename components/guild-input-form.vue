<!--
  表单内的服务器 ID 输入字段。
-->

<script lang="ts" setup>
import { FormItem } from '@arco-design/web-vue';
import type { FieldRule } from '@arco-design/web-vue';

export type RuleType = FieldRule<bigint | undefined>;
export interface Props {
  /** 当前输入的服务器 ID 。 */
  modelValue?: bigint;
  // 以下透传
  field: string;
  label?: string;
  required?: boolean;
  rules?: RuleType[];
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  label: '服务器 ID',
  rules: () => [],
});

const emit = defineEmits([
  'update:model-value',
]);

/** 字段状态。 */
type Status = 'error' | 'success' | 'warning' | 'validating' | undefined;
const status = ref(undefined as Status);
/** 是否为错误的输入。 */
const badInput = ref(false);

/** 合并属性到 rules 中。 */
function wrapRules(rules: RuleType[]): RuleType[] {
  const result = [ ...rules ];
  if (props.required) {
    result.push({
      required: true,
      message: '本项必填',
    });
  }
  return result;
}
const rules = wrapRules(props.rules);

function update(v: bigint) {
  badInput.value = false;
  status.value = 'success';
  emit('update:model-value', v);
}
function error() {
  badInput.value = true;
  status.value = 'error';
}
</script>

<template>
  <FormItem
    v-bind='$attrs'
    :field='field'
    :label='label'
    :required='required'
    :rules='rules'
    :validate-status='status'
  >
    <template v-if='badInput' #help>
      错误的服务器 ID
    </template>
    <GuildInput
      :model-value='modelValue'
      @change='update'
      @error='error'
    />
  </FormItem>
</template>
