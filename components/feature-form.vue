<script lang="ts" setup>
import { Message } from '@arco-design/web-vue';
import jsonBigint from 'json-bigint';

export interface Props<F extends {} = {}> {
  /** 表单信息。 */
  modelValue: F;
  /** 是否正在加载中。 */
  loading?: boolean;
  /** 加载中文字。 */
  loadingText?: string;
  /** 提交按钮文字。 */
  submitText?: string;
}
export interface Events<F extends {} = {}> {
  (event: 'update:modelValue', value: F): void;
  (event: 'submit'): void;
}
const props = withDefaults(defineProps<Props<{}>>(), {
  loading: false,
  loadingText: '正在执行',
  submitText: '提交',
});

const emit = defineEmits<Events>();

/** 是否正在保存草稿。 */
const saving = ref(false);
/** 获取当前草稿在 `localStorage` 中的键。 */
function getDraftKey() {
  return `draft${useRoute().path}`;
}
/** 使用草稿。 */
async function restoreDraft() {
  const draft = localStorage.getItem(getDraftKey());
  if (!draft) return;
  emit('update:modelValue', jsonBigint.parse(draft));
}
/** 保存草稿。 */
async function saveDraft() {
  saving.value = true;
  try {
    const draft = jsonBigint.stringify(toRaw(props.modelValue));
    localStorage.setItem(getDraftKey(), draft);
    Message.success({ content: '保存成功', duration: 2500 });
  } catch (e) {
    console.error(e);
    Message.error({ content: '保存失败', duration: 5000 });
  }
  saving.value = false;
}

onBeforeMount(() => {
  restoreDraft();
});
</script>

<template>
  <ASpin class='form-wrapper block mx-auto my-0' :loading='props.loading' :tip='props.loadingText'>
    <AForm class='w-full' :model='props.modelValue' auto-label-width @submit-success='() => emit("submit")'>
      <slot />
      <AFormItem>
        <ASpace>
          <AButton type='primary' html-type='submit'>
            {{ props.submitText }}
          </AButton>
          <AButton type='secondary' :loading='saving' @click='() => saveDraft()'>
            保存草稿
          </AButton>
        </ASpace>
      </AFormItem>
    </AForm>
  </ASpin>
</template>

<style lang="postcss" scoped>
.form-wrapper {
  @apply w-8/12;
}
.mobile .form-wrapper {
  @apply w-10/12;
}
</style>
