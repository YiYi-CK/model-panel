<template>
  <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="110">
    <!-- Provider ID -->
    <n-form-item path="id" :label="$t('provider.providerId')">
      <n-input
        v-model:value="form.id"
        :placeholder="$t('provider.idPlaceholder')"
        :disabled="isEdit"
      />
    </n-form-item>

    <!-- Base URL -->
    <n-form-item path="baseUrl" :label="$t('provider.baseUrl')">
      <n-input
        v-model:value="form.baseUrl"
        :placeholder="$t('provider.urlPlaceholder')"
      />
    </n-form-item>

    <!-- API Type -->
    <n-form-item path="api" :label="$t('provider.apiType')">
      <n-select
        v-model:value="form.api"
        :options="apiOptions"
        :placeholder="$t('provider.apiTypePlaceholder')"
      />
    </n-form-item>

    <!-- API Key -->
    <n-form-item :label="$t('provider.apiKey')">
      <n-input
        v-model:value="form.apiKey"
        :type="showKey ? 'text' : 'password'"
        :placeholder="isEdit ? $t('provider.apiKeyEditPlaceholder') : $t('provider.apiKeyPlaceholder')"
        clearable
        show-password-on="click"
      />
    </n-form-item>

    <!-- Auth Mode -->
    <n-form-item :label="$t('provider.authMode')">
      <n-select
        v-model:value="form.auth"
        :options="authOptions"
        placeholder="api-key"
        clearable
      />
    </n-form-item>

    <!-- Region -->
    <n-form-item :label="$t('provider.region')">
      <n-input
        v-model:value="form.region"
        placeholder="us-east-1"
      />
    </n-form-item>

    <!-- Timeout -->
    <n-form-item :label="$t('provider.timeout')">
      <n-input-number v-model:value="form.timeoutSeconds" :min="1" :max="300" clearable :placeholder="$t('provider.timeoutPlaceholder')" />
    </n-form-item>
  </n-form>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  initialData: { type: Object, default: null },
});
defineEmits(['submit', 'cancel']);

const { t } = useI18n();

const isEdit = computed(() => !!props.initialData);
const showKey = ref(false);

const form = reactive({
  id: '',
  baseUrl: '',
  api: null,
  apiKey: '',
  auth: null,
  region: '',
  timeoutSeconds: null,
});

// 回填编辑数据
watch(() => props.initialData, (data) => {
  if (data) {
    form.id = data.id || '';
    form.baseUrl = data.baseUrl || '';
    form.api = data.api || null;
    form.apiKey = ''; // 编辑时不留原始 key 值
    form.auth = data.auth || null;
    form.region = data.region || '';
    form.timeoutSeconds = data.timeoutSeconds || null;
  }
}, { immediate: true });

const apiOptions = [
  { label: 'openai-completions', value: 'openai-completions' },
  { label: 'anthropic-messages', value: 'anthropic-messages' },
  { label: 'google-gemini', value: 'google-gemini' },
  { label: 'ollama', value: 'ollama' },
];

const authOptions = [
  { label: 'api-key', value: 'api-key' },
  { label: 'token', value: 'token' },
  { label: 'oauth', value: 'oauth' },
  { label: 'aws-sdk', value: 'aws-sdk' },
];

const rules = computed(() => ({
  id: [
    { required: true, message: t('provider.idRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_.-]{2,64}$/, message: t('provider.idFormat'), trigger: 'blur' },
  ],
  baseUrl: [
    { required: true, message: t('provider.urlRequired'), trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: t('provider.urlFormat'), trigger: 'blur' },
  ],
  api: [
    { required: true, message: t('provider.apiRequired'), trigger: 'change' },
  ],
}));

function getFormData() {
  const data = {
    id: form.id,
    baseUrl: form.baseUrl,
    api: form.api,
  };
  if (form.apiKey) data.apiKey = form.apiKey;
  if (form.auth) data.auth = form.auth;
  if (form.region) data.region = form.region;
  if (form.timeoutSeconds) data.timeoutSeconds = form.timeoutSeconds;
  return data;
}

defineExpose({ getFormData });
</script>
