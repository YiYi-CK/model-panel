<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-notification-provider>
        <router-view />
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
// Naive UI 主题微调，保持和设计系统一致
const themeOverrides = {
  common: {
    primaryColor: '#2080F0',
    primaryColorHover: '#4098FC',
    primaryColorPressed: '#1870D8',
    borderRadius: '6px',
  },
  Card: {
    borderRadius: '8px',
  },
};
</script>
