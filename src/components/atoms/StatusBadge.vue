<template>
  <n-tag :type="tagType" size="small" :bordered="false">
    <template #icon>
      <span class="dot" :class="`dot-${status}`" />
    </template>
    {{ displayText }}
  </n-tag>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'unknown',
    validator: (v) => ['running', 'error', 'unknown', 'offline'].includes(v),
  },
  text: { type: String, default: '' },
});

const statusMap = {
  running: { type: 'success', text: '运行中' },
  error: { type: 'error', text: '异常' },
  unknown: { type: 'default', text: '未知' },
  offline: { type: 'default', text: '离线' },
};

const tagType = computed(() => statusMap[props.status]?.type || 'default');
const displayText = computed(() => props.text || statusMap[props.status]?.text || '未知');
</script>

<style scoped>
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 2px;
}
.dot-running { background: #18A058; }
.dot-error { background: #D03050; }
.dot-unknown { background: #C2C2C2; }
.dot-offline { background: #C2C2C2; }
</style>
