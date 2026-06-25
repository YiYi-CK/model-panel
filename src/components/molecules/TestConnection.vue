<template>
  <div class="test-connection">
    <n-button
      size="small"
      :loading="testing"
      :type="result ? (result.success ? 'success' : 'error') : 'default'"
      @click="test"
    >
      <template v-if="testing">{{ $t('connection.testing') }}</template>
      <template v-else-if="result && result.success">✅ {{ result.message }}</template>
      <template v-else-if="result && !result.success">❌ {{ result.error }}</template>
      <template v-else>{{ $t('connection.test') }}</template>
    </n-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/api';

const props = defineProps({
  baseUrl: { type: String, required: true },
});

const { t } = useI18n();
const testing = ref(false);
const result = ref(null);

async function test() {
  if (!props.baseUrl) return;
  testing.value = true;
  result.value = null;
  try {
    const res = await api.post('/test-connection', { baseUrl: props.baseUrl });
    result.value = res.data;
  } catch (err) {
    result.value = { success: false, error: err.response?.data?.error || t('connection.failed') };
  } finally {
    testing.value = false;
  }
}
</script>

<style scoped>
.test-connection {
  display: inline-block;
}
</style>
