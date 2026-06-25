<template>
  <n-button text size="tiny" type="primary" @click="copy">
    {{ label || '📋 复制' }}
  </n-button>
</template>

<script setup>
import { useMessage } from 'naive-ui';

const props = defineProps({
  text: { type: String, required: true },
  label: { type: String, default: '' },
});
const message = useMessage();

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text);
    message.success('已复制', { duration: 2000 });
  } catch (_) {
    message.error('复制失败', { duration: 2000 });
  }
}
</script>
