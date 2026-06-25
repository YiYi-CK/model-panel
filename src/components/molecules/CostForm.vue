<template>
  <n-collapse>
    <n-collapse-item title="成本配置 (可选)" name="cost">
      <n-grid :cols="2" :x-gap="12">
        <n-grid-item>
          <n-form-item label="Input ($/M)">
            <n-input-number
              :value="modelValue?.input"
              :min="0"
              :step="0.01"
              clearable
              placeholder="0"
              @update:value="update('input', $event)"
            />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="Output ($/M)">
            <n-input-number
              :value="modelValue?.output"
              :min="0"
              :step="0.01"
              clearable
              placeholder="0"
              @update:value="update('output', $event)"
            />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="Cache Read ($/M)">
            <n-input-number
              :value="modelValue?.cacheRead"
              :min="0"
              :step="0.01"
              clearable
              placeholder="0"
              @update:value="update('cacheRead', $event)"
            />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="Cache Write ($/M)">
            <n-input-number
              :value="modelValue?.cacheWrite"
              :min="0"
              :step="0.01"
              clearable
              placeholder="0"
              @update:value="update('cacheWrite', $event)"
            />
          </n-form-item>
        </n-grid-item>
      </n-grid>
    </n-collapse-item>
  </n-collapse>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({ input: null, output: null, cacheRead: null, cacheWrite: null }) },
});
const emit = defineEmits(['update:modelValue']);

function update(key, val) {
  emit('update:modelValue', { ...props.modelValue, [key]: val });
}
</script>
