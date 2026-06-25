<template>
  <n-form-item :label="label">
    <n-select
      :value="modelValue"
      :options="options"
      :placeholder="placeholder"
      :disabled="disabled"
      clearable
      @update:value="$emit('update:modelValue', $event)"
    />
  </n-form-item>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: null },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
</script>
