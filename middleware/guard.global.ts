import useAccountStore from '~~/stores/account';
import useMainStore from '~~/stores/main';

import { Message } from '@arco-design/web-vue';

export default defineNuxtRouteMiddleware(() => {
  const router = useRouter();
  router.beforeEach((to, from, next) => {
    if (to.meta.needLogin === true) { // 需要登录
      if (!useAccountStore().activeBotToken) { // 未登录
        Message.warning({
          content: '请先添加机器人',
          duration: 3000,
        });
        next('/login');
        return; // next 只能调用一次
      }
    }
    next();
  });
  router.afterEach(() => {
    if (useMainStore().needReload) { // 需要重新加载
      useMainStore().needReload = false;
      location.reload();
    }
  });
});