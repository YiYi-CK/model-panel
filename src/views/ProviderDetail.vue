<template>
  <MainLayout>
    <div class="provider-detail">
      <!-- 面包屑 -->
      <n-breadcrumb class="breadcrumb">
        <n-breadcrumb-item @click="$router.push('/dashboard')">{{ $t('nav.dashboard') }}</n-breadcrumb-item>
        <n-breadcrumb-item @click="$router.push('/providers')">{{ $t('nav.providers') }}</n-breadcrumb-item>
        <n-breadcrumb-item>{{ id }}</n-breadcrumb-item>
      </n-breadcrumb>

      <!-- 加载态 -->
      <template v-if="loading">
        <n-card class="info-card"><n-skeleton text :repeat="3" /></n-card>
        <n-card class="model-card"><n-skeleton text :repeat="4" /></n-card>
      </template>

      <!-- 错误态 -->
      <n-card v-else-if="error" class="error-card">
        <n-result status="error" :title="$t('common.error')" :description="error">
          <template #footer>
            <n-button @click="fetchData">{{ $t('common.retry') }}</n-button>
            <n-button @click="$router.push('/providers')">{{ $t('common.back') }}</n-button>
          </template>
        </n-result>
      </n-card>

      <!-- 正常态 -->
      <template v-else>
        <!-- Provider 信息卡片 -->
        <n-card class="info-card">
          <div class="provider-header">
            <h3>{{ id }}</h3>
            <n-space>
              <n-button size="small" @click="openEditDrawer">
                <template #icon><n-icon><EditOutlined /></n-icon></template>
                {{ $t('provider.edit') }}
              </n-button>
            </n-space>
          </div>

          <n-grid :cols="2" :x-gap="24" :y-gap="12" class="provider-info-grid">
            <n-grid-item>
              <div class="kv"><span class="kv-label">{{ $t('provider.baseUrl') }}</span> <code class="kv-code">{{ provider.baseUrl }}</code></div>
            </n-grid-item>
            <n-grid-item>
              <div class="kv"><span class="kv-label">{{ $t('provider.apiType') }}</span> <n-tag size="small">{{ provider.api }}</n-tag></div>
            </n-grid-item>
            <n-grid-item>
              <div class="kv">
                <span class="kv-label">{{ $t('provider.authMode') }}</span> <span>{{ provider.auth || 'api-key' }}</span>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="kv">
                <span class="kv-label">{{ $t('provider.apiKey') }}</span>
                <span v-if="provider.apiKey" class="api-key-masked">
                  {{ provider.apiKey }}
                  <n-button text size="tiny" type="primary" @click="copyApiKey(provider.apiKey)">📋</n-button>
                </span>
                <span v-else-if="provider._hasApiKey" class="api-key-hidden">{{ $t('provider.apiKeyHidden') }}</span>
                <span v-else class="api-key-none">{{ $t('provider.apiKeyNotSet') }}</span>
              </div>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- Model 管理区 -->
        <n-card class="model-card">
          <div class="model-header">
            <h3>{{ $t('model.title') }} ({{ models.length }})</h3>
            <n-space>
              <n-button size="small" @click="openImportDrawer">
                <template #icon><n-icon><ImportOutlined /></n-icon></template>
                {{ $t('model.import') }}
              </n-button>
              <n-button size="small" type="primary" @click="openCreateModel">
                <template #icon><n-icon><PlusOutlined /></n-icon></template>
                {{ $t('model.add') }}
              </n-button>
            </n-space>
          </div>

          <!-- 空态 -->
          <n-empty v-if="models.length === 0" :description="$t('model.noModel')">
            <template #extra>
              <n-button type="primary" @click="openCreateModel">{{ $t('model.addFirst') }}</n-button>
            </template>
          </n-empty>

          <!-- Model 表格 -->
          <n-data-table
            v-else
            :columns="modelColumns"
            :data="models"
            :row-key="(row) => row.id"
            :bordered="false"
          />
        </n-card>
      </template>

      <!-- Provider 编辑抽屉 -->
      <ProviderDrawer
        :show="editDrawerShow"
        mode="edit"
        :initial-data="provider"
        @close="editDrawerShow = false"
        @saved="onProviderSaved"
      />

      <!-- Model 抽屉 -->
      <ModelDrawer
        :show="modelDrawerShow"
        :mode="modelDrawerMode"
        :initial-data="selectedModel"
        :provider-id="id"
        :provider-api="provider?.api"
        @close="modelDrawerShow = false"
        @saved="onModelSaved"
      />

      <!-- 导入抽屉 -->
      <ImportDrawer
        :show="importDrawerShow"
        :provider-id="id"
        @close="importDrawerShow = false"
        @saved="onModelSaved"
      />

      <!-- 删除 Model 确认 -->
      <n-modal
        v-model:show="deleteModelDialog"
        preset="dialog"
        :title="$t('provider.confirmDelete')"
        :content="deleteModelConfirmContent"
        :positive-text="$t('common.confirm')"
        :negative-text="$t('common.cancel')"
        :positive-button-props="{ type: 'error' }"
        @positive-click="confirmDeleteModel"
      />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, h } from 'vue';
import { useNotification, NButton, NIcon, NTag } from 'naive-ui';
import { PlusOutlined, EditOutlined, ImportOutlined } from '@vicons/antd';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import ProviderDrawer from '@/components/organisms/ProviderDrawer.vue';
import ModelDrawer from '@/components/organisms/ModelDrawer.vue';
import ImportDrawer from '@/components/organisms/ImportDrawer.vue';
import api from '@/api';

const props = defineProps({ id: String });
const notification = useNotification();
const { t } = useI18n();

const loading = ref(true);
const error = ref('');
const provider = ref(null);
const models = ref([]);

// 编辑 Provider
const editDrawerShow = ref(false);

// Model 抽屉
const modelDrawerShow = ref(false);
const modelDrawerMode = ref('create');
const selectedModel = ref(null);

// 导入抽屉
const importDrawerShow = ref(false);

// 删除确认
const deleteModelDialog = ref(false);
const deleteModelTarget = ref(null);

// 删除确认内容（避免模板中嵌套引号）
const deleteModelConfirmContent = computed(() => {
  const id = deleteModelTarget.value?.id || '';
  return t('model.deleteConfirm', { id });
});

// Model 表格列
const modelColumns = computed(() => [
  {
    title: t('model.modelId'),
    key: 'id',
    width: 200,
    render: (row) => h('code', { class: 'id-code' }, row.id),
  },
  {
    title: t('model.modelName'),
    key: 'name',
    width: 180,
    render: (row) => row.name || row.id,
  },
  {
    title: t('model.reasoning'),
    key: 'reasoning',
    width: 60,
    align: 'center',
    render: (row) => row.reasoning ? '🧠' : '',
  },
  {
    title: t('model.inputTypes'),
    key: 'input',
    width: 150,
    render: (row) => {
      const types = row.input || [];
      return h('span', types.map((t) => {
        const icons = { text: '📝', image: '🖼️', audio: '🎙️' };
        return icons[t] || t;
      }).join(' '));
    },
  },
  {
    title: t('model.contextWindow'),
    key: 'contextWindow',
    width: 120,
    render: (row) => row.contextWindow ? formatNumber(row.contextWindow) : '-',
  },
  {
    title: t('model.maxTokens'),
    key: 'maxTokens',
    width: 110,
    render: (row) => row.maxTokens ? formatNumber(row.maxTokens) : '-',
  },
  {
    title: 'Cost (In/Out)',
    key: 'cost',
    width: 130,
    render: (row) => {
      if (!row.cost) return '-';
      const c = row.cost;
      return `$${c.input || 0}/$${c.output || 0}`;
    },
  },
  {
    title: t('model.actions'),
    key: 'actions',
    width: 120,
    render: (row) => {
      return h('div', { class: 'action-btns' }, [
        h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => editModel(row) }, { default: () => t('model.edit') }),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => promptDeleteModel(row) }, { default: () => t('model.delete') }),
      ]);
    },
  },
]);

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return String(n);
}

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const [providerRes, modelsRes] = await Promise.all([
      api.get(`/providers/${props.id}`),
      api.get(`/providers/${props.id}/models`),
    ]);
    provider.value = providerRes.data.provider;
    models.value = modelsRes.data.models || [];
  } catch (err) {
    error.value = err.response?.data?.error || t('common.error');
  } finally {
    loading.value = false;
  }
}

function openEditDrawer() {
  editDrawerShow.value = true;
}

function onProviderSaved() {
  editDrawerShow.value = false;
  fetchData();
}

function openCreateModel() {
  selectedModel.value = null;
  modelDrawerMode.value = 'create';
  modelDrawerShow.value = true;
}

function editModel(model) {
  selectedModel.value = model;
  modelDrawerMode.value = 'edit';
  modelDrawerShow.value = true;
}

function openImportDrawer() {
  importDrawerShow.value = true;
}

function onModelSaved() {
  modelDrawerShow.value = false;
  importDrawerShow.value = false;
  selectedModel.value = null;
  fetchData();
}

function promptDeleteModel(model) {
  deleteModelTarget.value = model;
  deleteModelDialog.value = true;
}

async function confirmDeleteModel() {
  if (!deleteModelTarget.value) return;
  try {
    await api.delete(`/providers/${props.id}/models/${deleteModelTarget.value.id}`);
    notification.success({ title: t('model.deleteSuccess', { id: deleteModelTarget.value.id }), duration: 3000 });
    fetchData();
  } catch (err) {
    notification.error({ title: t('model.deleteFailed'), content: err.response?.data?.error || t('model.deleteFailed'), duration: 3000 });
  }
  deleteModelTarget.value = null;
}

function copyApiKey(key) {
  notification.info({ title: t('common.apiKeyInfo'), duration: 3000 });
}

onMounted(fetchData);
</script>

<style scoped>
.provider-detail {
  max-width: 1100px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2225;
  margin: 0 0 24px;
}

.info-card {
  margin-bottom: 24px;
}

.provider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.provider-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.provider-info-grid {
  font-size: 14px;
}

.kv {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kv-label {
  color: #50555A;
  min-width: 90px;
}

.kv-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  background: #F7F8FA;
  padding: 2px 8px;
  border-radius: 4px;
}

.api-key-masked {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #50555A;
}

.api-key-hidden {
  font-size: 14px;
  color: #50555A;
}

.api-key-none {
  font-size: 13px;
  color: #C2C2C2;
  font-style: italic;
}

.model-card {
  margin-top: 24px;
}

.model-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.model-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.id-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  background: #F7F8FA;
  padding: 2px 8px;
  border-radius: 4px;
}

.action-btns {
  display: flex;
  gap: 4px;
}

.error-card {
  margin-top: 24px;
}
</style>
