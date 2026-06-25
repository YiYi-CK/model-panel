<template>
  <n-form-item :label="label" label-placement="left">
    <n-switch :value="modelValue" @update:value="$emit('update:modelValue', $event)" />
  </n-form-item>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
});
defineEmits(['update:modelValue']);
</script>
