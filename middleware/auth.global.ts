import { useServiceConfig } from '~~/config';

/** 缓存的上次鉴权时间。 */
let last: Date = new Date(0);

export default defineNuxtRouteMiddleware((to) => {
  return new Promise((resolve) => {
    const { auth } = useServiceConfig();
    if (!auth) { // 无需鉴权
      resolve();
      return;
    }
    if (Number(last) + auth.maxAge >= Date.now()) { // 缓存有效
      resolve();
      return;
    }
    if (to.fullPath !== '/auth') { // 非鉴权页面
      async function doNavigate(authorized: boolean) {
        if (!authorized) {
          last = new Date(); // 更新缓存
          await navigateTo('/auth', { replace: true }); // 重新授权
          resolve();
        } else resolve();
      }
      const v = auth.isAuthorized();
      if (typeof v === 'boolean') { // 同步获取
        doNavigate(v);
      } else { // 异步获取
        v.then(doNavigate);
      }
    } else {
      resolve();
    }
  });
});
