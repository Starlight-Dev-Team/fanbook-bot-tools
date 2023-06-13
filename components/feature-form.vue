<script lang="ts" setup>
import { Message } from '@arco-design/web-vue';
import { openDB } from 'idb';

export interface Props<F extends {} = {}> {
  /** 表单信息。 */
  modelValue: F;
  /** 是否正在加载中。 */
  loading?: boolean;
  /** 提交按钮文字。 */
  submitText?: string;
}
export interface Events<F extends {} = {}> {
  (event: 'update:modelValue', value: F): void;
  (event: 'submit'): void;
}
const props = withDefaults(defineProps<Props<{}>>(), {
  loading: false,
  submitText: '提交',
});

const emit = defineEmits<Events>();

const DRAFT_STORE_NAME = 'draft';
/** 使用草稿。 */
async function restoreDraft() {
  const db = await idb({
    upgrade(db) {
      db.createObjectStore(DRAFT_STORE_NAME);
    }
  });
  if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
    const tx = db.transaction(DRAFT_STORE_NAME, 'versionchange');
    await tx.done;
  }
  const tx = db.transaction(DRAFT_STORE_NAME, 'readonly');
  const draft = await tx.store.get(useRoute().path);
  await tx.done;
  db.close();
  if (!draft) return;
  emit('update:modelValue', draft);
}
/** 保存草稿。 */
async function saveDraft() {
  try {
    const db = await idb();
    const { store } = db.transaction(DRAFT_STORE_NAME, 'readwrite');
    store.put(toRaw(props.modelValue), useRoute().path);
    await store.transaction.done;
    db.close();
    Message.success({ content: '保存成功', duration: 2500 });
  } catch (e) {
    console.error(e);
    Message.error({ content: '保存失败', duration: 5000 });
  }
}
onMounted(() => {
  if (SUPPORT_INDEXEDDB) restoreDraft().catch((e) => console.error(e));
});
</script>

<template>
  <ASpin class='form-wrapper block mx-auto my-0' :loading='props.loading' tip='正在执行'>
    <AForm class='w-full' :model='props.modelValue' auto-label-width @submit-success='() => emit("submit")'>
      <slot />
      <AFormItem>
        <ASpace>
          <AButton type='primary' html-type='submit'>
            {{ props.submitText }}
          </AButton>
          <AButton v-if='SUPPORT_INDEXEDDB' type='secondary' @click='() => saveDraft()'>
            保存草稿
          </AButton>
        </ASpace>
      </AFormItem>
    </AForm>
  </ASpin>
</template>

<style lang="postcss" scoped>
.desktop .form-wrapper {
  @apply w-8/12;
}
</style>
