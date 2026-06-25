<template>
  <n-form-item :label="label" :feedback="errorText" :validation-status="errorText ? 'error' : undefined">
    <n-input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      clearable
      @update:value="$emit('update:modelValue', $event)"
    />
  </n-form-item>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  disabled: { type: Boolean, default: false },
  errorText: { type: String, default: '' },
  maxlength: { type: Number, default: undefined },
});
defineEmits(['update:modelValue']);
</script>
