import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/Index.vue'),
  },
  {
    path: '/about',
    component: () => import('@/pages/About.vue'),
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
    ],
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('@/components/404.vue'),
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
