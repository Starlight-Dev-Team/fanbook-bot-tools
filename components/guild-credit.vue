<script lang="ts" setup>
import type { GuildCredit } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

import { selectImage } from '~/utils/biz/select-image';

export interface Props {
  modelValue: GuildCredit;
  editable?: boolean;
}
export interface Events {
  (event: 'update:modelValue', value: GuildCredit): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const data = ref(props.modelValue);
watch(data, (v) => emit('update:modelValue', v)); // data 更新后向上传递

async function handleEditAuthorityIcon() {
  if (!props.editable) return;
  const value = await selectImage({ title: '修改图片', defaultLink: '' });
  if (value) data.value.authority.icon = value;
}
async function handleEditSlotImage(i: number, j: number) {
  if (!props.editable) return;
  const value = await selectImage({ title: '修改图片', defaultLink: '' });
  if (value) data.value.slots[i][j].image = value;
}
function handleAddSlot(row: number) {
  data.value.slots[row].push({
    image: LOGO_URL,
    value: '文字',
  });
}
function handleRemoveSlot(row: number) {
  data.value.slots[row].pop();
}
function handleAddSlotRow() {
  const l = data.value.slots.push([])
  handleAddSlot(l - 1);
}
function handleRemoveSlotRow() {
  data.value.slots.pop();
}
</script>

<template>
  <ACard v-bind='$attrs' class='rounded-lg'>
    <ARow v-for='(slots, i) in data.slots' class='justify-center flex-col'>
      <AScrollbar class='slot-row w-full'>
        <div class='flex w-full overflow-auto'>
          <div v-for='(slot, j) in slots' class='flex flex-col items-center mb-2 w-full min-w-[100px]'>
            <AAvatar
              v-if='slot.image'
              class='w-[52px] h-[52px] bg-transparent'
              :image-url='slot.image'
              @click='() => handleEditSlotImage(i, j)'
            >
              <template v-if='editable' #trigger-icon>
                <IconEdit />
              </template>
            </AAvatar>
            <ATypographyParagraph
              :editable='editable'
              v-model:edit-text='slot.value'
            >
              {{ slot.value }}
            </ATypographyParagraph>
          </div>
          <div v-if='editable' class='flex flex-col'>
            <ADivider direction='vertical' />
            <CreditOpButtons
              class='flex-col'
              add
              :remove='slots.length > 1'
              @add='() => handleAddSlot(i)'
              @remove='() => handleRemoveSlot(i)'
            />
          </div>
        </div>
      </AScrollbar>
    </ARow>
    <template v-if='editable'>
      <ADivider class='mt-0 mb-2' />
      <div class='flex justify-center w-full'>
        <CreditOpButtons
          add
          :remove='data.slots.length > 1'
          @add='handleAddSlotRow'
          @remove='handleRemoveSlotRow'
        />
      </div>
    </template>
    <template #title>
      <AAvatar
        class='min-w-[36px] min-h-[36px] bg-transparent'
        :image-url='data.authority.icon'
        @click='handleEditAuthorityIcon'
      >
        <template v-if='editable' #trigger-icon>
          <IconEdit />
        </template>
      </AAvatar>
      <ATypographyParagraph
        class='inline-flex items-center ml-2 font-bold'
        :editable='editable'
        v-model:edit-text='data.authority.name'
      >
        {{ data.authority.name }}
      </ATypographyParagraph>
    </template>
  </ACard>
</template>

<style lang="postcss" scoped>
.arco-card:deep() {
  .arco-scrollbar {
    @apply w-full;
  }
  .arco-card-body {
    @apply py-2;
  }
  .arco-typography {
    @apply m-0;
  }
  .arco-typography-edit-content {
    @apply inline-flex;
    @apply m-0;
    @apply left-0;
    input {
      @apply text-center;
    }
  }
  .arco-card-header-title {
    @apply inline-flex;
    .arco-typography-edit-content input {
      @apply text-left;
    }
    .arco-avatar-image {
      @apply rounded-lg;
    }
  }
  .arco-avatar-image > img {
    object-fit: contain;
  }
}
</style>
