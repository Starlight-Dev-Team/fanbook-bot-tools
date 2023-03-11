import { ref } from 'vue';

import { createPinia, defineStore } from 'pinia';

export const pinia = createPinia();

export const useMainStore = defineStore('main', () => {
  const needReload = ref(false);
  return {
    needReload,
  };
});

export default useMainStore;
