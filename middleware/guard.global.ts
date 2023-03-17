import useMainStore from '~~/stores/main';

import type {
  RouteLocationNormalized,
} from 'vue-router';

import { isAuthorized } from '~~/utils/account';

import { Message } from '@arco-design/web-vue';

/**
 * 如果页面需要登录且未登录，则导航到登录界面。
 * @returns 是否已导航
 */
export async function checkAuth(
  to: RouteLocationNormalized,
): Promise<boolean> {
  if (to.meta.requiredAuth === true) { // 需要登录
    if (!isAuthorized()) { // 未登录
      Message.warning({
        content: '请先添加机器人',
        duration: 3000,
      });
      await useRouter().replace('/login');
      return true;
    }
  }
  return false;
}
/**
 * 如果需要重新加载，则重新加载。
 * @returns 是否已重新加载
 */
export function checkReload(): boolean {
  if (useMainStore().needReload) { // 需要重新加载
    useMainStore().needReload = false;
    location.reload();
    return true;
  }
  return false;
}

export default defineNuxtRouteMiddleware(() => {
  const router = useRouter();
  router.beforeEach(async(to, from, next) => {
    if (!await checkAuth(to)) next();
  });
  router.afterEach((to) => {
    return new Promise<void>((resolve) => {
      if (!checkReload()) resolve();
    });
  });
});
