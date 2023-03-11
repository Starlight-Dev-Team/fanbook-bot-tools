import { initAccountStore } from '~~/stores/account';

export default defineNuxtPlugin(async() => {
  await initAccountStore();
});
