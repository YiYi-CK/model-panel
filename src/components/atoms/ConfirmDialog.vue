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

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  content: { type: String, default: '' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  type: { type: String, default: 'warning' },
});

defineEmits(['confirm', 'cancel', 'update:show']);

const positiveButtonProps = computed(() => {
  const typeMap = { warning: { type: 'warning' }, error: { type: 'error' }, info: { type: 'primary' } };
  return typeMap[props.type] || {};
});
</script>
