<template>
  <div :class="['loading-spinner', { inline }]">
    <n-spin :show="true">
      <template #description>{{ text }}</template>
      <div class="spinner-placeholder" />
    </n-spin>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '加载中...' },
  inline: { type: Boolean, default: false },
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}
.loading-spinner.inline {
  padding: 16px 0;
}
.spinner-placeholder {
  width: 40px;
  height: 40px;
}
</style>
