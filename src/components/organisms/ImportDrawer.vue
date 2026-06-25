<template>
  <n-drawer v-model:show="show" :width="560" placement="right" @after-leave="handleClose">
    <n-drawer-content :title="$t('model.importTitle')" closable>
      <!-- JSON 输入 -->
      <div class="import-section">
        <p class="import-hint">{{ $t('model.importPaste') }}：</p>
        <n-input
          v-model:value="jsonText"
          type="textarea"
          :rows="10"
          placeholder='[{"id": "gpt-4o", "name": "GPT-4o", "contextWindow": 128000, "maxTokens": 16384}]'
          @update:value="parseJSON"
        />
      </div>

      <!-- JSON 解析错误 -->
      <n-alert v-if="parseError" type="error" class="parse-alert" :title="parseError" />

      <!-- 预览 -->
      <div v-if="previewModels.length > 0" class="preview-section">
        <h4>{{ $t('model.importPreview', { n: previewModels.length }) }}</h4>
        <n-data-table
          :columns="previewColumns"
          :data="previewModels"
          :row-key="(row) => row.id"
          :bordered="false"
          size="small"
          max-height="300"
        />
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="show = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="importing"
            :disabled="previewModels.length === 0"
            @click="handleImport"
          >
            {{ $t('model.importButton', { n: previewModels.length }) }}
          </n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, watch, h, computed } from 'vue';
import { useNotification } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import api from '@/api';

const props = defineProps({
  show: { type: Boolean, default: false },
  providerId: { type: String, required: true },
});

const emit = defineEmits(['close', 'saved']);
const notification = useNotification();
const { t } = useI18n();

const show = ref(props.show);
const jsonText = ref('');
const parseError = ref('');
const previewModels = ref([]);
const importing = ref(false);

watch(() => props.show, (val) => {
  show.value = val;
  if (val) {
    jsonText.value = '';
    parseError.value = '';
    previewModels.value = [];
  }
});

const previewColumns = computed(() => [
  { title: t('model.modelId'), key: 'id', width: 200, render: (row) => h('code', { class: 'id-code' }, row.id) },
  { title: 'Name', key: 'name', width: 160, render: (row) => row.name || '-' },
  { title: 'Ctx', key: 'contextWindow', width: 80, render: (row) => row.contextWindow ? formatNum(row.contextWindow) : '-' },
  { title: t('model.maxTokens'), key: 'maxTokens', width: 90, render: (row) => row.maxTokens ? formatNum(row.maxTokens) : '-' },
]);

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return String(n);
}

function parseJSON() {
  parseError.value = '';
  previewModels.value = [];
  if (!jsonText.value.trim()) return;

  try {
    const parsed = JSON.parse(jsonText.value);
    if (!Array.isArray(parsed)) {
      parseError.value = t('model.jsonNotArray');
      return;
    }
    if (parsed.length === 0) {
      parseError.value = t('model.jsonNotEmpty');
      return;
    }
    // 校验每个元素
    for (let i = 0; i < parsed.length; i++) {
      const m = parsed[i];
      if (!m.id) {
        parseError.value = t('model.jsonMissingId', { i: i + 1 });
        return;
      }
      if (!/^[a-zA-Z0-9_.-]{2,64}$/.test(m.id)) {
        parseError.value = t('model.jsonInvalidId', { i: i + 1, id: m.id });
        return;
      }
    }
    previewModels.value = parsed;
  } catch (e) {
    parseError.value = t('model.jsonParseError', { message: e.message });
  }
}

function handleClose() {
  emit('close');
}

async function handleImport() {
  importing.value = true;
  try {
    await api.post(`/providers/${props.providerId}/models/import`, {
      models: previewModels.value,
    });
    notification.success({
      title: t('model.importSuccess', { n: 0 }),
      content: t('model.importSuccess', { n: previewModels.value.length }),
      duration: 3000,
    });
    emit('saved');
  } catch (err) {
    notification.error({
      title: t('model.importFailed'),
      content: err.response?.data?.error || t('model.importFailed'),
      duration: 4000,
    });
  } finally {
    importing.value = false;
  }
}
</script>

<style scoped>
.import-section {
  margin-bottom: 16px;
}
.import-hint {
  font-size: 14px;
  color: #50555A;
  margin-bottom: 8px;
}
.parse-alert {
  margin-bottom: 16px;
}
.preview-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}
.id-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: #F7F8FA;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
