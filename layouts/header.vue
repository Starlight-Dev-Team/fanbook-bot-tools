<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';

import {
  Button,
  Doption,
  Dropdown,
  Dsubmenu,
  Message,
  PageHeader,
  Space,
} from '@arco-design/web-vue';

import { back } from '~~/utils/router';

import { useAccountStore } from '~~/stores/account';

import { Bot } from '@starlight-dev-team/fanbook-api-sdk';
import type { Profile } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

import { switchBot } from '~~/utils/account';

const accountStore = useAccountStore();

const defaultTitle = 'Fanbook 机器人工具';

let botsProfile: Record<string, Profile> = {};

let activeProfile = ref(undefined as Profile | undefined);

function switchToBot(token: string) {
  Message.loading({
    content: '正在切换机器人',
    duration: NaN,
  });
  switchBot(token);
  location.reload();
}

const loading = ref(true);

onBeforeMount(async () => {
  const store = useAccountStore();
  for (const token of store.botTokens) {
    const bot = new Bot(token);
    botsProfile[token] = await bot.getProfile();
  }
  activeProfile.value = botsProfile[accountStore.activeBotToken ?? ''];
  loading.value = false;
});
</script>

<template>
  <PageHeader
    :title='$route.meta.title as string ?? defaultTitle'
    :show-back='$route.path !== "/"'
    @back='back'
  >
    <template #extra>
      <ClientOnly>
        <Dropdown
          v-if='activeProfile || loading'
          trigger='hover'
          position='br'
        >
          <BotInfo class='bot-avatar' :profile='activeProfile' />
          <template #content>
            <Dsubmenu trigger='hover'>
              <template #default>切换机器人</template>
              <template #content>
                <Doption
                  v-for='(profile, token) in botsProfile'
                  class='bot-list'
                  @click='() => switchToBot(token)'
                >
                  <BotInfo :profile='profile' />
                </Doption>
              </template>
            </Dsubmenu>
            <Doption @click='() => $router.push("/login")'>
              添加机器人
            </Doption>
          </template>
        </Dropdown>
        <Space v-else>
          <Button type='primary' @click='() => $router.push("/login")'>
            登录
          </Button>
        </Space>
      </ClientOnly>
    </template>
  </PageHeader>
</template>

<style scoped>
:deep() .arco-page-header-extra {
  overflow: visible;
  height: 30px;
}
:deep() .bot-avatar {
  margin-top: -5px;
}
.bot-list {
  line-height: unset;
}
body.mobile .bot-avatar:deep() .bot-avatar,
body.mobile .bot-avatar:deep() .bot-avatar-loading {
  visibility: hidden;
  width: 0;
  height: 100%;
}
</style>
