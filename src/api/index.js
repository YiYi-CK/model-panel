import axios from 'axios';

// Axios 实例 — 自动携带 cookie
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
});

// 响应拦截器: 统一处理 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // 未登录，跳转登录页
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
