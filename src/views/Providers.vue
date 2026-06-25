<template>
  <MainLayout>
    <div class="providers-page">
      <div class="page-header">
        <h2 class="page-title">{{ $t('provider.title') }}</h2>
        <n-button type="primary" @click="openCreateDrawer">
          <template #icon><n-icon><PlusOutlined /></n-icon></template>
          {{ $t('provider.add') }}
        </n-button>
      </div>

      <!-- 搜索 -->
      <n-input
        v-model:value="searchQuery"
        :placeholder="$t('provider.search')"
        clearable
        class="search-input"
      >
        <template #prefix><n-icon><SearchOutlined /></n-icon></template>
      </n-input>

      <!-- 加载态 -->
      <n-skeleton v-if="loading" text :repeat="3" />

      <!-- 空态 -->
      <n-card v-else-if="filteredProviders.length === 0 && !searchQuery" class="empty-card">
        <n-empty :description="$t('provider.noProvider')">
          <template #extra>
            <n-button type="primary" @click="openCreateDrawer">{{ $t('provider.add') }}</n-button>
          </template>
        </n-empty>
      </n-card>

      <!-- 搜索无结果 -->
      <n-card v-else-if="filteredProviders.length === 0 && searchQuery" class="empty-card">
        <n-empty :description="$t('provider.noMatch')" />
      </n-card>

      <!-- Provider 表格 -->
      <n-data-table
        v-else
        :columns="columns"
        :data="filteredProviders"
        :row-key="(row) => row.id"
        :bordered="false"
        class="provider-table"
      />

      <!-- Provider 抽屉 -->
      <ProviderDrawer
        :show="drawerShow"
        :mode="drawerMode"
        :initial-data="selectedProvider"
        @close="closeDrawer"
        @saved="onSaved"
      />

      <!-- 删除确认 -->
      <n-modal
        v-model:show="deleteDialogShow"
        preset="dialog"
        :title="$t('provider.confirmDelete')"
        :content="deleteConfirmContent"
        :positive-text="$t('common.confirm')"
        :negative-text="$t('common.cancel')"
        :positive-button-props="{ type: 'error' }"
        @positive-click="confirmDelete"
      />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification, NButton, NIcon, NTag } from 'naive-ui';
import { PlusOutlined, SearchOutlined } from '@vicons/antd';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import ProviderDrawer from '@/components/organisms/ProviderDrawer.vue';
import api from '@/api';

const router = useRouter();
const notification = useNotification();
const { t } = useI18n();

const loading = ref(true);
const providers = ref([]);
const searchQuery = ref('');

// 抽屉状态
const drawerShow = ref(false);
const drawerMode = ref('create');
const selectedProvider = ref(null);

// 删除确认
const deleteDialogShow = ref(false);
const deleteTarget = ref(null);

// 删除确认内容（避免模板中嵌套引号）
const deleteConfirmContent = computed(() => {
  const id = deleteTarget.value?.id || '';
  return t('provider.deleteConfirm', { id });
});

// 过滤后的列表
const filteredProviders = computed(() => {
  if (!searchQuery.value) return providers.value;
  const q = searchQuery.value.toLowerCase();
  return providers.value.filter(
    (p) => p.id.toLowerCase().includes(q) || p.baseUrl.toLowerCase().includes(q)
  );
});

// 表格列定义
const columns = computed(() => [
  {
    title: t('provider.providerId'),
    key: 'id',
    width: 180,
    render: (row) => h('code', { class: 'provider-id-code' }, row.id),
  },
  {
    title: t('provider.baseUrl'),
    key: 'baseUrl',
    ellipsis: { tooltip: true },
  },
  {
    title: t('provider.apiType'),
    key: 'api',
    width: 180,
    render: (row) => h(NTag, { size: 'small', bordered: false }, { default: () => row.api }),
  },
  {
    title: t('provider.modelCount'),
    key: 'modelCount',
    width: 80,
    align: 'center',
  },
  {
    title: t('provider.actions'),
    key: 'actions',
    width: 200,
    render: (row) => {
      return h('div', { class: 'action-btns' }, [
        h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => viewProvider(row.id) }, { default: () => t('provider.detail') }),
        h(NButton, { size: 'small', quaternary: true, onClick: () => testConnection(row) }, { default: () => t('provider.test') }),
        h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => promptDelete(row) }, { default: () => t('provider.delete') }),
      ]);
    },
  },
]);

async function fetchProviders() {
  loading.value = true;
  try {
    const res = await api.get('/providers');
    providers.value = res.data.providers || [];
  } catch (err) {
    notification.error({ title: t('common.error'), content: err.response?.data?.error || t('provider.fetchFailed'), duration: 3000 });
  } finally {
    loading.value = false;
  }
}

function openCreateDrawer() {
  selectedProvider.value = null;
  drawerMode.value = 'create';
  drawerShow.value = true;
}

function viewProvider(id) {
  router.push(`/providers/${id}`);
}

async function testConnection(provider) {
  notification.info({ title: t('connection.testing'), content: `${provider.baseUrl} ...`, duration: 2000 });
  try {
    const res = await api.post('/test-connection', { baseUrl: provider.baseUrl });
    if (res.data.success) {
      notification.success({ title: t('connection.success'), content: res.data.message, duration: 3000 });
    } else {
      notification.error({ title: t('connection.failed'), content: res.data.error, duration: 4000 });
    }
  } catch (err) {
    notification.error({ title: t('connection.failed'), content: err.response?.data?.error || t('connection.failed'), duration: 3000 });
  }
}

function promptDelete(provider) {
  deleteTarget.value = provider;
  deleteDialogShow.value = true;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  try {
    await api.delete(`/providers/${deleteTarget.value.id}`);
    notification.success({ title: t('provider.deleteSuccess', { id: deleteTarget.value.id }), duration: 3000 });
    fetchProviders();
  } catch (err) {
    notification.error({ title: t('provider.deleteFailed'), content: err.response?.data?.error || t('provider.deleteFailed'), duration: 3000 });
  }
  deleteTarget.value = null;
}

function closeDrawer() {
  drawerShow.value = false;
  selectedProvider.value = null;
}

function onSaved() {
  drawerShow.value = false;
  selectedProvider.value = null;
  fetchProviders();
}

onMounted(fetchProviders);
</script>

<style scoped>
.providers-page {
  max-width: 1100px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2225;
  margin: 0;
}

.search-input {
  margin-bottom: 16px;
  max-width: 360px;
}

.provider-id-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  background: #F7F8FA;
  padding: 2px 8px;
  border-radius: 4px;
}

.provider-table {
  margin-top: 8px;
}

.action-btns {
  display: flex;
  gap: 4px;
}

.empty-card {
  margin-top: 24px;
}
</style>
