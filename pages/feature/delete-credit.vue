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
  guild: string;
  user: string;
  card: string;
}
const input = reactive({
  guild: '',
  user: '',
  card: '',
} as Input);

const REQUEIRE_RULE: FieldRule = {
  required: true,
  message: '本项必填',
};

type Status = 'default' | 'loading';
const status = ref('default' as Status);

const bot = new Bot(useAccountStore().activeBotToken as string);

function bigintValidator(value: string, cb: (error?: string) => void) {
  if (tryBigintify(value) === undefined) cb('数据填写错误');
  else cb(undefined);
}

async function onSubmit() {
  status.value = 'loading';
  let user: bigint;
  try {
    user = await bot.getUserByShortId({
      guild: BigInt(input.guild),
      id: Number(input.user),
    });
  } catch (err) {
    console.error(err);
    Message.error({
      content: '请检查 用户# 是否正确',
      duration: 3000,
    });
    return;
  }
  try {
    await bot.deleteGuildUserCredit({
      guild: BigInt(input.guild),
      user,
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
      <FormItem label='服务器 ID' field='guild' :rules='[REQUEIRE_RULE, {
        validator: bigintValidator,
      }]'>
        <Input v-model='input.guild' />
      </FormItem>
      <FormItem label='用户 #' field='user' :rules='[REQUEIRE_RULE, {
        validator(value, cb) {
          cb((!Number.isNaN(Number(value)) ? undefined : "错误的 Fanbook #"));
        },
      }]' tooltip='显示在个人主页'>
        <Input v-model='input.user'>
          <template #prefix>#</template>
        </Input>
      </FormItem>
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
