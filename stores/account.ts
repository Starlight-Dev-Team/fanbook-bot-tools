import { ref } from 'vue';

import { defineStore } from 'pinia';

import { getBots } from '~~/utils/account';

export const useAccountStore = defineStore('account', () => {
  return {
    botTokens: ref([] as string[]),
    activeBotToken: ref(undefined as string | undefined),
  };
});

export function initAccountStore() {
  const botTokens = getBots();
  useAccountStore().$patch({
    botTokens,
    activeBotToken: botTokens[0] ?? undefined,
  });
}

export default useAccountStore;
