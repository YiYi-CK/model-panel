<template>
  <div class="kv-row">
    <span class="kv-label">{{ label }}</span>
    <code v-if="monospace" class="kv-value code">{{ value }}</code>
    <span v-else class="kv-value">{{ value }}</span>
    <CopyButton v-if="copyable && value" :text="String(value)" />
  </div>
</template>

<script setup>
import CopyButton from '@/components/atoms/CopyButton.vue';

defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  monospace: { type: Boolean, default: false },
  copyable: { type: Boolean, default: false },
});
</script>

<style scoped>
.kv-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.kv-label {
  min-width: 120px;
  font-size: 14px;
  color: #50555A;
}
.kv-value {
  font-size: 14px;
  color: #1F2225;
}
.kv-value.code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  background: #F7F8FA;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
