<template>
  <GuestLayout>
    <div class="login-form">
      <div class="logo-area">
        <span class="logo-icon">🦊</span>
        <h1>{{ $t('app.title') }}</h1>
      </div>

      <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
        <n-form-item path="username" :label="$t('login.username')">
          <n-input
            v-model:value="form.username"
            :placeholder="$t('login.usernamePlaceholder')"
            :disabled="loading"
            @keydown.enter="handleLogin"
          />
        </n-form-item>

        <n-form-item path="password" :label="$t('login.password')">
          <n-input
            v-model:value="form.password"
            type="password"
            :placeholder="$t('login.passwordPlaceholder')"
            :disabled="loading"
            show-password-on="click"
            @keydown.enter="handleLogin"
          />
        </n-form-item>

        <n-form-item>
          <n-switch v-model:value="form.rememberMe" :disabled="loading" />
          <span class="remember-label">{{ $t('login.rememberMe') }}</span>
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            block
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? $t('login.submitting') : $t('login.submit') }}
          </n-button>
        </n-form-item>
      </n-form>
    </div>
  </GuestLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import GuestLayout from '@/layouts/GuestLayout.vue';
import api from '@/api';

const router = useRouter();
const notification = useNotification();
const { t } = useI18n();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
});

const rules = computed(() => ({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
    { max: 32, message: t('login.usernameTooLong'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
  ],
}));

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
        title: t('login.failed'),
        content: res.data.error || t('login.wrongCreds'),
        duration: 3000,
      });
    }
  } catch (err) {
    if (err.response && err.response.data) {
      notification.error({
        title: t('login.failed'),
        content: err.response.data.error || t('login.wrongCreds'),
        duration: 3000,
      });
    } else {
      notification.error({
        title: t('login.failed'),
        content: t('login.networkError'),
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
