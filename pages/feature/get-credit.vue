<script lang="ts" setup>
import type { GuildCredit } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

definePageMeta({
  title: '查询荣誉卡槽',
  requiredAuth: true,
});

const bot = getCurrentBot();
type Status = 'filling' | 'loading' | 'submitted';
const status: Ref<Status> = ref('filling');

interface Input {
  guild?: bigint;
  user?: number;
  _userId?: bigint;
}
const input: Ref<Input> = ref({});
const credits: Ref<GuildCredit[]> = ref([]);

async function handleSubmit() {
  status.value = 'loading';
  credits.value = await bot.getGuildUserCredit({
    guild: input.value.guild!,
    user: input.value._userId!,
  });
  status.value = 'submitted';
}
</script>

<template>
  <FeatureForm
    v-if='status !== "submitted"'
    v-model='input'
    submit-text='查询'
    :loading='status === "loading"'
    loading-text='正在查询'
    @submit='handleSubmit'
  >
    <AFormItem field='guild' label='目标服务器' required :rules='[FORM_REQUIRE_RULE, FORM_GUILD_RULE]'>
      <GuildInput v-model='input.guild' />
    </AFormItem>
    <UserInputForm
      v-model:user='input.user'
      field='user'
      label='目标用户'
      :guild='input.guild'
      required
      @change='(v) => input._userId = v'
    />
  </FeatureForm>
  <AList
    v-else
    class='w-full'
    :data='credits'
    :pagination-props='{ pageSize: 3, total: credits.length, simple: true }'
  >
    <template #item='{ item }'>
      <AListItem class='w-full'>
        <AListItemMeta>
          <template #title>
            <ATypographyParagraph
              :ellipsis='{ rows: 1, showTooltip: true }'
              copyable
              :copy-text='item.id'
            >荣誉 ID：{{ item.id }}</ATypographyParagraph>
          </template>
        </AListItemMeta>
        <GuildCredit class='w-full' :model-value='item'/>
      </AListItem>
    </template>
  </AList>
</template>

<style lang="postcss" scoped>
:deep() .arco-list-item-meta-content {
  @apply h-5;
}
</style>
