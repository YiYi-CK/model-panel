<template>
  <div class="guest-layout">
    <!-- 语言切换 -->
    <div class="lang-switch">
      <n-button text size="small" @click="toggleLang">
        {{ $t('nav.lang') }}
      </n-button>
    </div>
    <n-card class="login-card" :bordered="true">
      <slot />
    </n-card>
    <div class="footer">{{ $t('app.host') }}</div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

function toggleLang() {
  const newLocale = locale.value === 'zh-CN' ? 'en' : 'zh-CN';
  locale.value = newLocale;
  localStorage.setItem('model-panel-lang', newLocale);
}
</script>

<style scoped>
.lang-switch {
  position: absolute;
  top: 16px;
  right: 24px;
}

.guest-layout {
  position: relative;
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
