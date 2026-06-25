<template>
  <n-button text size="tiny" type="primary" @click="copy">
    {{ label || '📋' }}
  </n-button>
</template>

<script setup>
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  text: { type: String, required: true },
  label: { type: String, default: '' },
});
const message = useMessage();
const { t } = useI18n();

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text);
    message.success(t('common.copied'), { duration: 2000 });
  } catch (_) {
    message.error(t('common.copyFailed'), { duration: 2000 });
  }
}
</script>
