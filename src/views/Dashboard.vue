<template>
  <MainLayout>
    <div class="dashboard">
      <h2 class="page-title">配置概览</h2>

      <!-- 统计卡片 -->
      <n-grid v-if="!loading" :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
        <n-grid-item>
          <n-card class="stat-card" hoverable @click="$router.push('/providers')">
            <div class="stat-label">Provider 数量</div>
            <div class="stat-value">{{ dashboard.providerCount }}</div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card">
            <div class="stat-label">总 Model 数</div>
            <div class="stat-value">{{ dashboard.totalModelCount }}</div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card">
            <div class="stat-label">配置模式</div>
            <div class="stat-value--code">{{ dashboard.mode }}</div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card">
            <div class="stat-label">默认模型</div>
            <div class="stat-value--code">{{ dashboard.defaultModel || '未设置' }}</div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 加载骨架 -->
      <n-grid v-else :cols="4" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="i in 4" :key="i">
          <n-card>
            <n-skeleton text :repeat="2" />
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 默认模型设置 -->
      <n-card class="info-card" v-if="!loading && models.length > 0">
        <h3>默认模型</h3>
        <div class="model-setting">
          <n-select
            v-model:value="selectedModel"
            :options="modelOptions"
            placeholder="选择默认模型"
            style="width: 360px"
            :consistent-menu-width="false"
          />
          <n-button
            type="primary"
            :disabled="!selectedModel || selectedModel === dashboard.defaultModel"
            :loading="saving"
            @click="saveDefaultModel"
          >
            {{ saving ? '保存中...' : '保存' }}
          </n-button>
        </div>
      </n-card>

      <!-- 配置信息 -->
      <n-card class="info-card" v-if="!loading">
        <n-space vertical :size="12">
          <div class="info-row">
            <span class="info-label">配置文件 Hash</span>
            <code class="info-code">{{ dashboard.configHash }}</code>
          </div>
        </n-space>
      </n-card>

      <!-- 空态引导 -->
      <n-card v-if="!loading && dashboard.providerCount === 0" class="empty-card">
        <n-empty description="暂无配置任何 Provider">
          <template #extra>
            <n-button type="primary" @click="$router.push('/providers')">
              前往添加 Provider
            </n-button>
          </template>
        </n-empty>
      </n-card>

      <!-- 错误态 -->
      <n-card v-if="error" class="error-card">
        <n-result status="error" title="获取配置失败" :description="error">
          <template #footer>
            <n-button @click="fetchDashboard">重试</n-button>
          </template>
        </n-result>
      </n-card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useNotification } from 'naive-ui';
import MainLayout from '@/layouts/MainLayout.vue';
import api from '@/api';

const notification = useNotification();
const loading = ref(true);
const error = ref('');
const saving = ref(false);

const dashboard = reactive({
  providerCount: 0,
  totalModelCount: 0,
  mode: 'merge',
  defaultModel: '',
  configHash: '',
});

// 可选模型列表
const models = ref([]);
const selectedModel = ref('');
const modelOptions = computed(() => {
  return models.value.map((m) => ({
    label: `${m.name} (${m.key})`,
    value: m.key,
  }));
});

async function fetchDashboard() {
  loading.value = true;
  error.value = '';
  try {
    const [dashRes, modelsRes] = await Promise.all([
      api.get('/dashboard'),
      api.get('/models'),
    ]);
    Object.assign(dashboard, dashRes.data);
    models.value = modelsRes.data.models || [];
    selectedModel.value = dashboard.defaultModel;  // 默认选中当前值
  } catch (err) {
    error.value = err.response?.data?.error || '获取仪表盘数据失败';
  } finally {
    loading.value = false;
  }
}

async function saveDefaultModel() {
  if (!selectedModel.value) return;
  saving.value = true;
  try {
    const res = await api.put('/default-model', { model: selectedModel.value });
    dashboard.defaultModel = selectedModel.value;
    notification.success({
      title: '设置成功',
      content: res.data.message || '默认模型已更新',
      duration: 3000,
    });
  } catch (err) {
    notification.error({
      title: '设置失败',
      content: err.response?.data?.error || '操作失败',
      duration: 3000,
    });
  } finally {
    saving.value = false;
  }
}

onMounted(fetchDashboard);
</script>

<style scoped>
.dashboard {
  max-width: 960px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2225;
  margin: 0 0 24px;
}

.stat-card {
  cursor: default;
}

.stat-label {
  font-size: 13px;
  color: #50555A;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2080F0;
}

.stat-value--code {
  font-size: 16px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: #1F2225;
  word-break: break-all;
}

.info-card {
  margin-top: 24px;
}

.info-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
}

.model-setting {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-label {
  font-size: 14px;
  color: #50555A;
  min-width: 120px;
}

.info-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  background: #F7F8FA;
  padding: 4px 12px;
  border-radius: 6px;
  color: #1F2225;
}

.empty-card,
.error-card {
  margin-top: 24px;
}
</style>
