<template>
  <n-form-item :label="label">
    <n-input-number
      :value="modelValue"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :disabled="disabled"
      clearable
      @update:value="$emit('update:modelValue', $event)"
    />
  </n-form-item>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: null },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: undefined },
  disabled: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
</script>
