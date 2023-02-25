import { ref } from 'vue';

import { createPinia, defineStore } from 'pinia';

import { getBots } from '@/utils/account';

export const pinia = createPinia();

export const useAccountStore = defineStore('account', () => {
  const botTokens = ref(getBots());
  return {
    botTokens,
    activeBotToken: ref(botTokens.value[0] ?? undefined),
  };
});
