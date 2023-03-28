import { useServiceConfig } from '~~/config';

export default defineNuxtPlugin(async() => {
  const { auth } = useServiceConfig();
  if (auth) { // 需要鉴权
    try {
      const user = await auth.getProfile();
      // 鉴权成功
      return {
        provide: {
          user,
        },
      };
    } catch { // 鉴权失败
      const path = useRoute().path;
      if (path !== '/auth' && path !== '/auth/') {
        location.pathname = '/auth';
      }
    }
  }
  return {};
});
