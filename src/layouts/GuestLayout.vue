<template>
  <div class="guest-layout">
    <n-card class="login-card" :bordered="true">
      <slot />
    </n-card>
    <div class="footer">{{ $t('app.host') }}</div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.guest-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F7F8FA;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
}

.footer {
  margin-top: 24px;
  font-size: 13px;
  color: #C2C2C2;
}
</style>
