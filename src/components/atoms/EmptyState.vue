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
import { useI18n } from 'vue-i18n';

defineProps({
  description: { type: String, default: '' },
  showAction: { type: Boolean, default: false },
});
const { t } = useI18n();
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
