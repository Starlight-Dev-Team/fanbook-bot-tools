<script lang="ts" setup>
import { FormItem } from '@arco-design/web-vue';
import type { FieldRule } from '@arco-design/web-vue';

export type RuleType = FieldRule<bigint | undefined>;
export interface Props {
  modelValue?: bigint;
  guild?: bigint;
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

const emit = defineEmits(['update:model-value']);

type Status = 'error' | 'success' | 'warning' | 'validating' | undefined;
const status = ref(undefined as Status);
const input = ref(props.modelValue?.toString());
const badInput = ref(false);

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

function onSuccess(v: bigint) {
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
      @success='onSuccess'
      @error='onError'
    />
  </FormItem>
</template>
