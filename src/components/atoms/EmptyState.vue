<template>
  <div class="empty-state">
    <n-empty :description="description">
      <template #header>
        <span class="empty-icon">📭</span>
      </template>
      <template #extra v-if="showAction">
        <slot />
      </template>
    </n-empty>
  </div>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' },
  showAction: { type: Boolean, default: false },
});
</script>

<style scoped>
.empty-state {
  padding: 48px 0;
  text-align: center;
}
.empty-icon {
  font-size: 48px;
}
</style>
