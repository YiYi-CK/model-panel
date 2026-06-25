<template>
  <div class="code-block">
    <div v-if="label" class="code-label">{{ label }}</div>
    <code class="code-content">{{ text }}</code>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
  label: { type: String, default: '' },
});
</script>

<style scoped>
.code-block {
  background: #F7F8FA;
  border-radius: 6px;
  padding: 8px 12px;
}
.code-label {
  font-size: 12px;
  color: #50555A;
  margin-bottom: 4px;
}
.code-content {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: #1F2225;
  word-break: break-all;
}
</style>
