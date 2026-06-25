<template>
  <GuestLayout>
    <div class="login-form">
      <div class="logo-area">
        <span class="logo-icon">🦊</span>
        <h1>OpenClaw 模型管理</h1>
      </div>

      <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
        <n-form-item path="username" label="用户名">
          <n-input
            v-model:value="form.username"
            placeholder="Linux 系统账号"
            :disabled="loading"
            @keydown.enter="handleLogin"
          />
        </n-form-item>

        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="输入密码"
            :disabled="loading"
            show-password-on="click"
            @keydown.enter="handleLogin"
          />
        </n-form-item>

        <n-form-item>
          <n-switch v-model:value="form.rememberMe" :disabled="loading" />
          <span class="remember-label">记住我 (24小时)</span>
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            block
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </n-button>
        </n-form-item>
      </n-form>
    </div>
  </GuestLayout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from 'naive-ui';
import GuestLayout from '@/layouts/GuestLayout.vue';
import api from '@/api';

const router = useRouter();
const notification = useNotification();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 32, message: '用户名过长', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
};

async function handleLogin() {
  if (loading.value) return;
  if (!form.username || !form.password) return;

  loading.value = true;
  try {
    const res = await api.post('/auth/login', {
      username: form.username,
      password: form.password,
      rememberMe: form.rememberMe,
    });

    if (res.data.ok) {
      router.push('/dashboard');
    } else {
      notification.error({
        title: '登录失败',
        content: res.data.error || '用户名或密码错误',
        duration: 3000,
      });
    }
  } catch (err) {
    if (err.response && err.response.data) {
      notification.error({
        title: '登录失败',
        content: err.response.data.error || '用户名或密码错误',
        duration: 3000,
      });
    } else {
      notification.error({
        title: '连接失败',
        content: '无法连接到服务器，请检查网络',
        duration: 3000,
      });
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-form {
  text-align: center;
}

.logo-area {
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 48px;
  display: block;
}

.logo-area h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2225;
  margin: 8px 0 0;
}

.remember-label {
  margin-left: 8px;
  font-size: 13px;
  color: #50555A;
}
</style>
