import { createRouter, createWebHistory } from 'vue-router';
import api from '@/api';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/providers',
    name: 'Providers',
    component: () => import('@/views/Providers.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/providers/:id',
    name: 'ProviderDetail',
    component: () => import('@/views/ProviderDetail.vue'),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ──────────────────────────────────────────────
// SessionGuard: 全局路由守卫
// ──────────────────────────────────────────────
router.beforeEach(async (to, _from, next) => {
  // 如果目标是登录页且是 guest 路由
  if (to.meta.guest) {
    try {
      const res = await api.get('/status');
      if (res.data.authenticated) {
        // 已登录用户访问 login → 重定向到 dashboard
        return next('/dashboard');
      }
    } catch (_) {
      // 未登录，正常访问 login
    }
    return next();
  }

  // 需要认证的路由
  if (to.meta.requiresAuth) {
    try {
      const res = await api.get('/status');
      if (res.data.authenticated) {
        return next();
      }
    } catch (_) {
      // 未认证
    }
    return next('/login');
  }

  next();
});

export default router;
