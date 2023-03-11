import { ref } from 'vue';

import { defineStore } from 'pinia';

import { getBots } from '~~/utils/account';
import { Bot } from '@starlight-dev-team/fanbook-api-sdk';
import type { Profile } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

export const useAccountStore = defineStore('account', () => {
  const botProfiles: Ref<Record<string, Profile>> = ref({});
  return {
    botTokens: ref([] as string[]),
    botProfiles,
    activeBotToken: ref(undefined as string | undefined),
  };
});

export async function initAccountStore() {
  const tokens = getBots();
  const botTokens: string[] = [];
  const botProfiles: Record<string, Profile> = {};
  for (const token of tokens) { // 过滤无效令牌、获取机器人信息
    try {
      botProfiles[token] = await (new Bot(token)).getProfile();
      botTokens.push(token);
    } catch {}
  }
  setBots(botTokens); // 覆盖回去，就去除了无效的令牌
  useAccountStore().$patch({
    botTokens,
    botProfiles,
    activeBotToken: tokens[0] ?? undefined,
  });
}

export default useAccountStore;
