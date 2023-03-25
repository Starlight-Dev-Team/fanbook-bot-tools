<script lang="ts" setup>
import { IconRefresh } from '@arco-design/web-vue/es/icon';

import { nanoid } from 'nanoid';

import { Bot } from '@starlight-dev-team/fanbook-api-sdk';
import type {
  GuildCredit,
} from '@starlight-dev-team/fanbook-api-sdk/dist/types';

import { useAccountStore } from '~~/stores/account';

import { tryBigintify } from '~~/utils/util';

import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  TypographyTitle,
  Spin,
} from '@arco-design/web-vue';
import type { FieldRule } from '@arco-design/web-vue';

definePageMeta({
  title: '删除荣誉卡槽',
  requiredAuth: true,
});

interface Input {
  guild?: bigint;
  user?: bigint;
  card: string;
}
const input = reactive({
  card: '',
} as Input);

const REQUEIRE_RULE: FieldRule = {
  required: true,
  message: '本项必填',
};

type Status = 'default' | 'loading';
const status = ref('default' as Status);

const bot = new Bot(useAccountStore().activeBotToken as string);

async function onSubmit() {
  status.value = 'loading';
  let user: bigint;
  try {
    await bot.deleteGuildUserCredit({
      guild: input.guild as bigint,
      user: input.user as bigint,
      card: input.card,
    });
    Message.success({
      content: '删除成功',
      duration: 2500,
    });
  } catch (err) {
    console.error(err);
    Message.error({
      content: '删除失败',
      duration: 6000,
    });
  }
  status.value = 'default';
}
</script>

<template>
  <Spin class='form-wrapper' :loading='status === "loading"' tip='正在执行'>
    <Form
      class='form'
      :model='input'
      :disabled='status === "loading"'
      auto-label-width
      @submit-success='onSubmit'
    >
      <GuildInputForm
        v-model='input.guild'
        field='guild'
        required
      />
      <UserInputForm
        v-model='input.user'
        :guild='input.guild'
        field='user'
        required
      />
      <FormItem
        label='自定义 ID'
        field='card'
        tooltip='对应设置荣誉卡槽时，填写的的自定义 ID'
        :rules='[REQUEIRE_RULE, { minLength: 10, message: "至少10字符" }]'
      >
        <Input v-model='input.card' />
      </FormItem>
      <FormItem class='operations'>
        <Button type='primary' html-type='submit'>
          删除荣誉卡槽
        </Button>
      </FormItem>
    </Form>
  </Spin>
</template>

<style scoped>
.form-wrapper {
  display: block;
  width: 70%;
  margin: 0 auto;
}
body.mobile .form-wrapper {
  width: 90vw;
}
.form {
  width: 100%;
}
.operations {
  margin-top: 4px;
}
</style>
