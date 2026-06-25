<template>
  <n-modal
    :show="show"
    preset="dialog"
    :title="title"
    :positive-text="confirmText"
    :negative-text="cancelText"
    :positive-button-props="positiveButtonProps"
    @positive-click="$emit('confirm')"
    @negative-click="$emit('cancel')"
    @update:show="$emit('update:show', $event)"
  >
    <p>{{ content }}</p>
  </n-modal>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  cancelText: { type: String, default: '' },
  type: { type: String, default: 'warning' },
});

defineEmits(['confirm', 'cancel', 'update:show']);
const { t } = useI18n();

const positiveButtonProps = computed(() => {
  const typeMap = { warning: { type: 'warning' }, error: { type: 'error' }, info: { type: 'primary' } };
  return typeMap[props.type] || {};
});
</script>
