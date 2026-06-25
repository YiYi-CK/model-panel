<template>
  <n-form-item :label="label">
    <n-select
      :value="modelValue"
      :options="options"
      multiple
      :placeholder="placeholder"
      @update:value="$emit('update:modelValue', $event)"
    />
  </n-form-item>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
});
defineEmits(['update:modelValue']);
const { t } = useI18n();
</script>
