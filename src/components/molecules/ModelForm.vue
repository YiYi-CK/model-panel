<template>
  <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="120">
    <!-- Model ID -->
    <n-form-item path="id" :label="$t('model.modelId')">
      <n-input
        v-model:value="form.id"
        placeholder="gpt-4o / deepseek-v4-flash"
        :disabled="isEdit"
      />
    </n-form-item>

    <!-- Model Name -->
    <n-form-item path="name" :label="$t('model.modelName')">
      <n-input
        v-model:value="form.name"
        :placeholder="$t('model.modelNamePlaceholder')"
      />
    </n-form-item>

    <!-- API Type -->
    <n-form-item :label="$t('model.apiType')">
      <n-select
        v-model:value="form.api"
        :options="apiOptions"
        :placeholder="apiPlaceholder"
        clearable
      />
    </n-form-item>

    <!-- Reasoning -->
    <n-form-item :label="$t('model.reasoning')" label-placement="left">
      <n-switch v-model:value="form.reasoning" />
    </n-form-item>

    <!-- Input Types -->
    <n-form-item :label="$t('model.inputTypes')">
      <n-select
        v-model:value="form.input"
        :options="inputTypeOptions"
        multiple
        :placeholder="$t('model.inputTypesPlaceholder')"
      />
    </n-form-item>

    <!-- Context Window -->
    <n-form-item path="contextWindow" :label="$t('model.contextWindow')">
      <n-input-number v-model:value="form.contextWindow" :min="1" :max="100000000" clearable :placeholder="$t('model.contextWindowPlaceholder')" />
    </n-form-item>

    <!-- Max Tokens -->
    <n-form-item path="maxTokens" :label="$t('model.maxTokens')">
      <n-input-number v-model:value="form.maxTokens" :min="1" :max="100000000" clearable :placeholder="$t('model.maxTokensPlaceholder')" />
    </n-form-item>

    <!-- 成本配置（折叠） -->
    <n-collapse>
      <n-collapse-item :title="$t('model.cost')" name="cost">
        <n-grid :cols="2" :x-gap="12">
          <n-grid-item>
            <n-form-item :label="$t('model.costInput')">
              <n-input-number v-model:value="form.cost.input" :min="0" :step="0.01" clearable placeholder="0" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item :label="$t('model.costOutput')">
              <n-input-number v-model:value="form.cost.output" :min="0" :step="0.01" clearable placeholder="0" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item :label="$t('model.costCacheRead')">
              <n-input-number v-model:value="form.cost.cacheRead" :min="0" :step="0.01" clearable placeholder="0" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item :label="$t('model.costCacheWrite')">
              <n-input-number v-model:value="form.cost.cacheWrite" :min="0" :step="0.01" clearable placeholder="0" />
            </n-form-item>
          </n-grid-item>
        </n-grid>
      </n-collapse-item>
    </n-collapse>
  </n-form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  initialData: { type: Object, default: null },
  providerApi: { type: String, default: 'openai-completions' },
});
const emit = defineEmits(['submit', 'cancel']);

const { t } = useI18n();

const isEdit = computed(() => !!props.initialData);

const apiPlaceholder = computed(() =>
  t('model.inheritProvider') + ' (' + (props.providerApi || 'openai-completions') + ')'
);

// 初始化表单
const form = reactive({
  id: '',
  name: '',
  api: null,
  reasoning: false,
  input: [],
  contextWindow: null,
  maxTokens: null,
  cost: { input: null, output: null, cacheRead: null, cacheWrite: null },
});

// 回填编辑数据
watch(() => props.initialData, (data) => {
  if (data) {
    form.id = data.id || '';
    form.name = data.name || '';
    form.api = data.api || null;
    form.reasoning = data.reasoning || false;
    form.input = data.input || [];
    form.contextWindow = data.contextWindow || null;
    form.maxTokens = data.maxTokens || null;
    if (data.cost) {
      form.cost.input = data.cost.input || null;
      form.cost.output = data.cost.output || null;
      form.cost.cacheRead = data.cost.cacheRead || null;
      form.cost.cacheWrite = data.cost.cacheWrite || null;
    }
  }
}, { immediate: true });

const apiOptions = [
  { label: 'openai-completions', value: 'openai-completions' },
  { label: 'anthropic-messages', value: 'anthropic-messages' },
  { label: 'google-gemini', value: 'google-gemini' },
  { label: 'ollama', value: 'ollama' },
];

const inputTypeOptions = [
  { label: 'text', value: 'text' },
  { label: 'image', value: 'image' },
  { label: 'audio', value: 'audio' },
];

const rules = computed(() => ({
  id: [
    { required: true, message: t('model.idRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_.-]{2,64}$/, message: t('model.idFormat'), trigger: 'blur' },
  ],
  contextWindow: [
    { type: 'number', min: 1, message: t('model.fieldPositive'), trigger: 'blur' },
  ],
  maxTokens: [
    { type: 'number', min: 1, message: t('model.fieldPositive'), trigger: 'blur' },
  ],
}));

// 暴露 getFormData
function getFormData() {
  return {
    id: form.id,
    name: form.name || undefined,
    api: form.api || undefined,
    reasoning: form.reasoning,
    input: form.input.length > 0 ? form.input : undefined,
    contextWindow: form.contextWindow || undefined,
    maxTokens: form.maxTokens || undefined,
    cost: form.cost.input || form.cost.output || form.cost.cacheRead || form.cost.cacheWrite
      ? {
          input: form.cost.input || 0,
          output: form.cost.output || 0,
          cacheRead: form.cost.cacheRead || 0,
          cacheWrite: form.cost.cacheWrite || 0,
        }
      : undefined,
  };
}

defineExpose({ getFormData });
</script>
