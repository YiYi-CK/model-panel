<template>
  <n-drawer v-model:show="show" :width="560" placement="right" @after-leave="handleClose">
    <n-drawer-content title="批量导入 Model" closable>
      <!-- JSON 输入 -->
      <div class="import-section">
        <p class="import-hint">粘贴 JSON 格式的模型列表（数组）：</p>
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
        <h4>预览 ({{ previewModels.length }} 个模型)</h4>
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
          <n-button @click="show = false">取消</n-button>
          <n-button
            type="primary"
            :loading="importing"
            :disabled="previewModels.length === 0"
            @click="handleImport"
          >
            导入 {{ previewModels.length }} 个模型
          </n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, watch, h } from 'vue';
import { useNotification } from 'naive-ui';
import api from '@/api';

const props = defineProps({
  show: { type: Boolean, default: false },
  providerId: { type: String, required: true },
});

const emit = defineEmits(['close', 'saved']);
const notification = useNotification();

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

const previewColumns = [
  { title: 'Model ID', key: 'id', width: 200, render: (row) => h('code', { class: 'id-code' }, row.id) },
  { title: 'Name', key: 'name', width: 160, render: (row) => row.name || '-' },
  { title: 'Ctx', key: 'contextWindow', width: 80, render: (row) => row.contextWindow ? formatNum(row.contextWindow) : '-' },
  { title: 'Max Tokens', key: 'maxTokens', width: 90, render: (row) => row.maxTokens ? formatNum(row.maxTokens) : '-' },
];

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
      parseError.value = 'JSON 必须是数组格式';
      return;
    }
    if (parsed.length === 0) {
      parseError.value = '数组不能为空';
      return;
    }
    // 校验每个元素
    for (let i = 0; i < parsed.length; i++) {
      const m = parsed[i];
      if (!m.id) {
        parseError.value = `第 ${i + 1} 个元素缺少 id 字段`;
        return;
      }
      if (!/^[a-zA-Z0-9_.-]{2,64}$/.test(m.id)) {
        parseError.value = `第 ${i + 1} 个元素 id "${m.id}" 格式不正确`;
        return;
      }
    }
    previewModels.value = parsed;
  } catch (e) {
    parseError.value = `JSON 解析失败: ${e.message}`;
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
      title: '导入成功',
      content: `已导入 ${previewModels.value.length} 个模型`,
      duration: 3000,
    });
    emit('saved');
  } catch (err) {
    notification.error({
      title: '导入失败',
      content: err.response?.data?.error || '批量导入失败',
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
