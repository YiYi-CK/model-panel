<template>
  <div class="model-row">
    <div class="row-main">
      <code class="model-id">{{ model.id }}</code>
      <span class="model-name">{{ model.name || model.id }}</span>
      <template v-if="model.reasoning"><span class="badge">🧠 {{ $t('model.reasoning') }}</span></template>
      <span class="ctx-info">{{ formatWindow(model.contextWindow) }} ctx / {{ formatWindow(model.maxTokens) }} max</span>
      <span v-if="model.cost" class="cost-info">${{ model.cost.input }}/${{ model.cost.output }}</span>
    </div>
    <div v-if="showActions" class="row-actions">
      <n-button size="tiny" quaternary type="primary" @click="$emit('edit', model.id)">{{ $t('model.edit') }}</n-button>
      <n-button size="tiny" quaternary type="error" @click="$emit('delete', model.id)">{{ $t('model.delete') }}</n-button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  model: { type: Object, required: true },
  showActions: { type: Boolean, default: true },
});
defineEmits(['edit', 'delete']);
const { t } = useI18n();

function formatWindow(n) {
  if (!n) return '-';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return String(n);
}
</script>

<style scoped>
.model-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}
.row-main {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.model-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  background: #F7F8FA;
  padding: 2px 8px;
  border-radius: 4px;
}
.model-name {
  color: #50555A;
}
.badge {
  font-size: 13px;
}
.ctx-info, .cost-info {
  font-size: 12px;
  color: #50555A;
}
.row-actions {
  display: flex;
  gap: 2px;
}
</style>
