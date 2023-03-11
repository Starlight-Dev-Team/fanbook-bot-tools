export default defineNuxtRouteMiddleware(() => {
  useRouter().addRoute({
    path: '/:catchAll(.*)',
    redirect: '/404',
  });
});
