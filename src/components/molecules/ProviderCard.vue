<template>
  <div class="provider-card">
    <div class="card-body">
      <h4 class="provider-id">{{ provider.id }}</h4>
      <div class="info-rows">
        <div class="kv"><span class="kv-label">Base URL</span> <code>{{ provider.baseUrl }}</code></div>
        <div class="kv"><span class="kv-label">API Type</span> <n-tag size="small">{{ provider.api }}</n-tag></div>
        <div class="kv"><span class="kv-label">Auth</span> <span>{{ provider.auth || 'api-key' }}</span></div>
        <div class="kv">
          <span class="kv-label">API Key</span>
          <span v-if="provider.apiKey" class="key-masked">{{ provider.apiKey }}</span>
          <span v-else-if="provider._hasApiKey" class="key-hidden">●●●●●●●●●●</span>
          <span v-else class="key-none">未设置</span>
        </div>
        <div class="kv">
          <span class="kv-label">模型数</span>
          <n-tag type="info" size="small">{{ provider.modelCount }} 个</n-tag>
        </div>
      </div>
    </div>
    <div v-if="showActions" class="card-actions">
      <n-button size="small" @click="$emit('view', provider.id)">详情</n-button>
      <n-button size="small" @click="$emit('test', provider.id)">测试</n-button>
      <n-button size="small" type="error" @click="$emit('delete', provider.id)">删除</n-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  provider: { type: Object, required: true },
  showActions: { type: Boolean, default: true },
});
defineEmits(['view', 'test', 'delete']);
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
