<template>
  <div class="app-logo">
    <span class="logo-icon">🦊</span>
    <h1>{{ $t('app.title') }}</h1>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.app-logo {
  text-align: center;
}
.logo-icon {
  font-size: 48px;
  display: block;
}
h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2225;
  margin: 8px 0 0;
}
</style>
