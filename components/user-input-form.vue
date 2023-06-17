<script lang="ts" setup>
import { FormItem } from '@arco-design/web-vue';
import type { FieldRule } from '@arco-design/web-vue';

export type RuleType = FieldRule<bigint | undefined>;
export interface Props {
  /** 用户短 ID 。 */
  user: number | undefined;
  /** 用户所在服务器 ID 。 */
  guild: bigint | undefined;
  // 以下透传
  field: string;
  label?: string;
  required?: boolean;
  rules?: RuleType[];
}
export interface Events {
  (event: 'update:user', value: number): void;
  (event: 'change', value: bigint): void;
}

const props = withDefaults(defineProps<Props>(), {
  label: '目标用户',
  required: false,
  rules: () => [],
});
const emit = defineEmits<Events>();

/** 当前输入的值。 */
const input: Ref<number | undefined> = ref();
watch(
  [() => props.guild, () => props.user],
  ([g, u]) => input.value = u,
  { immediate: true },
);
watch(input, (v) => v && emit('update:user', v));
/** 字段状态。 */
type Status = 'error' | 'success' | 'warning' | 'validating' | undefined;
const status: Ref<Status> = ref();
/** 是否为错误的输入。 */
const badInput = ref(false);

/** 合并属性到 rules 中。 */
function wrapRules(rules: RuleType[]): RuleType[] {
  const result = [ ...rules ];
  if (props.required) result.push(FORM_REQUIRE_RULE);
  return result;
}
const rules = wrapRules(props.rules);

function handleChange(v: bigint) {
  badInput.value = false;
  status.value = 'success';
  emit('change', v);
}
function handleError() {
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
      v-model:user='input'
      :guild='guild'
      @change='handleChange'
      @error='handleError'
    />
  </FormItem>
</template>
