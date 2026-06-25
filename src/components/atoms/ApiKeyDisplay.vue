<template>
  <span class="api-key-display">
    <template v-if="maskedKey">
      <code class="key-text">{{ maskedKey }}</code>
      <n-button v-if="showCopy" text size="tiny" type="primary" @click="copyToClipboard">
        📋
      </n-button>
    </template>
    <span v-else class="key-none">未设置</span>
  </span>
</template>

<script setup>
import { useMessage } from 'naive-ui';

const props = defineProps({
  maskedKey: { type: String, default: null },
  showCopy: { type: Boolean, default: true },
});

const message = useMessage();

function copyToClipboard() {
  // API Key 已脱敏，不能复制完整值
  message.info('API Key 已脱敏保护，无法复制完整值');
}
</script>

<style scoped>
.api-key-display {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.key-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #50555A;
}
.key-none {
  font-size: 13px;
  color: #C2C2C2;
  font-style: italic;
}
</style>
