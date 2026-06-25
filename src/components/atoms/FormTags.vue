<template>
  <n-form-item :label="label">
    <n-select
      :value="modelValue"
      :options="options"
      multiple
      :placeholder="'请选择'"
      @update:value="$emit('update:modelValue', $event)"
    />
  </n-form-item>
</template>

<script setup>
defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
});
defineEmits(['update:modelValue']);
</script>
