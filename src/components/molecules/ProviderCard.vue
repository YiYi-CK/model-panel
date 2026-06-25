<template>
  <div class="provider-card">
    <div class="card-body">
      <h4 class="provider-id">{{ provider.id }}</h4>
      <div class="info-rows">
        <div class="kv"><span class="kv-label">{{ $t('provider.baseUrl') }}</span> <code>{{ provider.baseUrl }}</code></div>
        <div class="kv"><span class="kv-label">{{ $t('provider.apiType') }}</span> <n-tag size="small">{{ provider.api }}</n-tag></div>
        <div class="kv"><span class="kv-label">{{ $t('provider.authMode') }}</span> <span>{{ provider.auth || 'api-key' }}</span></div>
        <div class="kv">
          <span class="kv-label">{{ $t('provider.apiKey') }}</span>
          <span v-if="provider.apiKey" class="key-masked">{{ provider.apiKey }}</span>
          <span v-else-if="provider._hasApiKey" class="key-hidden">{{ $t('provider.apiKeyHidden') }}</span>
          <span v-else class="key-none">{{ $t('provider.apiKeyNotSet') }}</span>
        </div>
        <div class="kv">
          <span class="kv-label">{{ $t('provider.modelCount') }}</span>
          <n-tag type="info" size="small">{{ provider.modelCount }}</n-tag>
        </div>
      </div>
    </div>
    <div v-if="showActions" class="card-actions">
      <n-button size="small" @click="$emit('view', provider.id)">{{ $t('provider.detail') }}</n-button>
      <n-button size="small" @click="$emit('test', provider.id)">{{ $t('provider.test') }}</n-button>
      <n-button size="small" type="error" @click="$emit('delete', provider.id)">{{ $t('provider.delete') }}</n-button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  provider: { type: Object, required: true },
  showActions: { type: Boolean, default: true },
});
defineEmits(['view', 'test', 'delete']);
const { t } = useI18n();
</script>

<style scoped>
.provider-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-body {
  flex: 1;
}
.provider-id {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #1F2225;
}
.info-rows {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  font-size: 13px;
}
.kv {
  display: flex;
  align-items: center;
  gap: 6px;
}
.kv-label {
  color: #50555A;
}
code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: #F7F8FA;
  padding: 1px 6px;
  border-radius: 4px;
}
.key-masked {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #50555A;
}
.key-hidden {
  color: #50555A;
}
.key-none {
  color: #C2C2C2;
  font-style: italic;
}
.card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>
