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
import { useI18n } from 'vue-i18n';

const props = defineProps({
  status: {
    type: String,
    default: 'unknown',
    validator: (v) => ['running', 'error', 'unknown', 'offline'].includes(v),
  },
  text: { type: String, default: '' },
});

const { t } = useI18n();

const statusMap = {
  running: { type: 'success', text: t('status.running') },
  error: { type: 'error', text: t('status.error') },
  unknown: { type: 'default', text: t('status.unknown') },
  offline: { type: 'default', text: t('status.offline') },
};

const tagType = computed(() => statusMap[props.status]?.type || 'default');
const displayText = computed(() => props.text || statusMap[props.status]?.text || t('status.unknown'));
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
