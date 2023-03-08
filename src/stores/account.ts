import { ref } from 'vue';

import { defineStore } from 'pinia';

import { getBots } from '@/utils/account';

export const useAccountStore = defineStore('account', () => {
  const botTokens = ref(getBots());
  return {
    botTokens,
    activeBotToken: ref(botTokens.value[0] ?? undefined),
  };
});
