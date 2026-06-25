<template>
  <MainLayout>
    <div class="providers-page">
      <div class="page-header">
        <h2 class="page-title">提供者管理</h2>
        <n-button type="primary" @click="openCreateDrawer">
          <template #icon><n-icon><PlusOutlined /></n-icon></template>
          添加 Provider
        </n-button>
      </div>

      <!-- 搜索 -->
      <n-input
        v-model:value="searchQuery"
        placeholder="搜索 Provider..."
        clearable
        class="search-input"
      >
        <template #prefix><n-icon><SearchOutlined /></n-icon></template>
      </n-input>

      <!-- 加载态 -->
      <n-skeleton v-if="loading" text :repeat="3" />

      <!-- 空态 -->
      <n-card v-else-if="filteredProviders.length === 0 && !searchQuery" class="empty-card">
        <n-empty description="还没有配置任何 Provider">
          <template #extra>
            <n-button type="primary" @click="openCreateDrawer">添加第一个 Provider</n-button>
          </template>
        </n-empty>
      </n-card>

      <!-- 搜索无结果 -->
      <n-card v-else-if="filteredProviders.length === 0 && searchQuery" class="empty-card">
        <n-empty description="没有匹配的 Provider" />
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
        title="确认删除"
        :content="deleteConfirmContent"
        positive-text="确认删除"
        negative-text="取消"
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
import MainLayout from '@/layouts/MainLayout.vue';
import ProviderDrawer from '@/components/organisms/ProviderDrawer.vue';
import api from '@/api';

const router = useRouter();
const notification = useNotification();

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
  return `确定要删除 Provider "${id}" 吗？该操作将同时删除其下所有 Model，且不可撤销。`;
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
const columns = [
  {
    title: 'Provider ID',
    key: 'id',
    width: 180,
    render: (row) => h('code', { class: 'provider-id-code' }, row.id),
  },
  {
    title: 'Base URL',
    key: 'baseUrl',
    ellipsis: { tooltip: true },
  },
  {
    title: 'API Type',
    key: 'api',
    width: 180,
    render: (row) => h(NTag, { size: 'small', bordered: false }, { default: () => row.api }),
  },
  {
    title: '模型数',
    key: 'modelCount',
    width: 80,
    align: 'center',
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) => {
      return h('div', { class: 'action-btns' }, [
        h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => viewProvider(row.id) }, { default: () => '详情' }),
        h(NButton, { size: 'small', quaternary: true, onClick: () => testConnection(row) }, { default: () => '测试' }),
        h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => promptDelete(row) }, { default: () => '删除' }),
      ]);
    },
  },
];

async function fetchProviders() {
  loading.value = true;
  try {
    const res = await api.get('/providers');
    providers.value = res.data.providers || [];
  } catch (err) {
    notification.error({ title: '加载失败', content: err.response?.data?.error || '获取 Provider 列表失败', duration: 3000 });
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
  notification.info({ title: '测试中', content: `正在测试 ${provider.baseUrl} ...`, duration: 2000 });
  try {
    const res = await api.post('/test-connection', { baseUrl: provider.baseUrl });
    if (res.data.success) {
      notification.success({ title: '连接成功', content: res.data.message, duration: 3000 });
    } else {
      notification.error({ title: '连接失败', content: res.data.error, duration: 4000 });
    }
  } catch (err) {
    notification.error({ title: '测试失败', content: err.response?.data?.error || '测试请求失败', duration: 3000 });
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
    notification.success({ title: '删除成功', content: `Provider "${deleteTarget.value.id}" 已删除`, duration: 3000 });
    fetchProviders();
  } catch (err) {
    notification.error({ title: '删除失败', content: err.response?.data?.error || '删除失败', duration: 3000 });
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
