import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAccountStore } from './stores/account';
import { Message } from '@arco-design/web-vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/Index.vue'),
  },
  {
    path: '/about',
    component: () => import('@/pages/About.vue'),
    meta: {
      title: '声明',
    },
  },
  {
    path: '/version',
    component: () => import('@/pages/Version.vue'),
  },
  {
    path: '/login',
    component: () => import('@/pages/Login.vue'),
    meta: { title: '添加机器人' },
  },
  {
    path: '/feature',
    children: [
      {
        path: 'send-message',
        component: () => import('@/pages/feature/SendMessage.vue'),
        meta: { title: '发送消息' },
      },
      {
        path: 'set-credit',
        component: () => import('@/pages/feature/SetCredit.vue'),
        meta: { title: '设置荣誉卡槽' },
      },
    ],
    meta: { needLogin: true },
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('@/components/404.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

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

export { router };

export default router;
