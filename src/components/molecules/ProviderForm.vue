<template>
  <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="110">
    <!-- Provider ID -->
    <n-form-item path="id" label="Provider ID">
      <n-input
        v-model:value="form.id"
        placeholder="如 my-provider"
        :disabled="isEdit"
      />
    </n-form-item>

    <!-- Base URL -->
    <n-form-item path="baseUrl" label="Base URL">
      <n-input
        v-model:value="form.baseUrl"
        placeholder="https://api.example.com/v1"
      />
    </n-form-item>

    <!-- API Type -->
    <n-form-item path="api" label="API Type">
      <n-select
        v-model:value="form.api"
        :options="apiOptions"
        placeholder="请选择 API Type"
      />
    </n-form-item>

    <!-- API Key -->
    <n-form-item label="API Key">
      <n-input
        v-model:value="form.apiKey"
        :type="showKey ? 'text' : 'password'"
        :placeholder="isEdit ? '留空不修改' : '输入 API Key'"
        clearable
        show-password-on="click"
      />
    </n-form-item>

    <!-- Auth Mode -->
    <n-form-item label="Auth Mode">
      <n-select
        v-model:value="form.auth"
        :options="authOptions"
        placeholder="api-key"
        clearable
      />
    </n-form-item>

    <!-- Region -->
    <n-form-item label="Region">
      <n-input
        v-model:value="form.region"
        placeholder="如 us-east-1"
      />
    </n-form-item>

    <!-- Timeout -->
    <n-form-item label="Timeout (秒)">
      <n-input-number v-model:value="form.timeoutSeconds" :min="1" :max="300" clearable placeholder="不限制" />
    </n-form-item>
  </n-form>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue';

const props = defineProps({
  initialData: { type: Object, default: null },
});
defineEmits(['submit', 'cancel']);

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

const rules = {
  id: [
    { required: true, message: '请输入 Provider ID', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_.-]{2,64}$/, message: '2-64字符，字母数字连字符', trigger: 'blur' },
  ],
  baseUrl: [
    { required: true, message: '请输入 Base URL', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '需以 http:// 或 https:// 开头', trigger: 'blur' },
  ],
  api: [
    { required: true, message: '请选择 API Type', trigger: 'change' },
  ],
};

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
