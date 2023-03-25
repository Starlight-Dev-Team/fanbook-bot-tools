<script lang="ts" setup>
import { FormItem } from '@arco-design/web-vue';
import type { FieldRule } from '@arco-design/web-vue';

export type RuleType = FieldRule<bigint | undefined>;
export interface Props {
  /** 当前获取到的用户 ID 。 */
  modelValue?: bigint;
  /** 用户所在服务器 ID 。 */
  guild?: bigint;
  // 以下透传
  field: string;
  label?: string;
  required?: boolean;
  rules?: RuleType[];
}

const props = withDefaults(defineProps<Props>(), {
  label: '目标用户',
  required: false,
  rules: () => [],
});

const emit = defineEmits([
  'update:model-value',
]);

/** 当前输入的值。 */
const input = ref(props.modelValue?.toString());
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

function onChange(v: bigint) {
  badInput.value = false;
  status.value = 'success';
  emit('update:model-value', v);
}
function onError() {
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
      用户不在此服务器内
    </template>
    <UserInput
      :model-value='modelValue'
      :guild='props.guild'
      @input='(v: string) => input = v'
      @change='onChange'
      @error='onError'
    />
  </FormItem>
</template>
