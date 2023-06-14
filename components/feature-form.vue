<script lang="ts" setup>
import { Message } from '@arco-design/web-vue';

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
const savingDebounced = refDebounced(saving, 500);
/** 草稿键。 */
const draftKey = useRoute().path;
/** 使用草稿。 */
async function restoreDraft() {
  const draft = await getDraft(draftKey);
  if (!draft) return;
  emit('update:modelValue', draft);
}
/** 保存草稿。 */
async function handleSaveDraft() {
  saving.value = true;
  try {
    await setDraft(draftKey, toRaw(props.modelValue));
    Message.success({ content: '保存成功', duration: 2500 });
  } catch (e) {
    console.error(e);
    Message.error({ content: '保存失败', duration: 5000 });
  }
  saving.value = false;
}

onMounted(async () => {
  if (SUPPORT_DRAFT) {
    saving.value = true;
    await restoreDraft();
    saving.value = false
  }
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
          <AButton type='secondary' :disabled='!SUPPORT_DRAFT' :loading='savingDebounced' @click='handleSaveDraft()'>
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
