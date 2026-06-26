<template>
  <MainLayout>
    <div class="agents-page">
      <h2 class="page-title">{{ $t('agent.title') }}</h2>

      <!-- 加载态 -->
      <div v-if="loading" class="loading-section">
        <n-card v-for="i in 3" :key="i" class="agent-card">
          <n-skeleton text :repeat="3" />
        </n-card>
      </div>

      <!-- 错误态 -->
      <n-card v-if="error" class="error-card">
        <n-result status="error" :title="$t('agent.fetchFailed')" :description="error">
          <template #footer>
            <n-button @click="fetchAgents">{{ $t('common.retry') }}</n-button>
          </template>
        </n-result>
      </n-card>

      <!-- 空态 -->
      <n-card v-if="!loading && !error && agents.length === 0" class="empty-card">
        <n-empty :description="$t('agent.noAgent')" />
      </n-card>

      <!-- Agent 树形列表 -->
      <template v-if="!loading && !error">
        <div v-for="agent in agents" :key="agent.id" class="agent-group">
          <!-- 父 agent 卡片 -->
          <n-card class="agent-card parent-card">
            <div class="agent-header">
              <div class="agent-info">
                <span class="agent-emoji">{{ agent.identity.emoji || '🤖' }}</span>
                <div>
                  <div class="agent-name">
                    <strong>{{ agent.name }}</strong>
                    <span class="agent-identity-name" v-if="agent.identity.name !== agent.name">
                      ({{ agent.identity.name }})
                    </span>
                    <n-tag v-if="agent.inheritsModel" size="tiny" :bordered="false" type="info">
                      {{ $t('agent.inheritsDefault') }}
                    </n-tag>
                  </div>
                  <div class="agent-meta" v-if="agent.workspace">
                    <span class="meta-label">{{ $t('agent.workspace') }}:</span>
                    <code>{{ agent.workspace }}</code>
                  </div>
                </div>
              </div>
            </div>

            <div class="agent-model-row">
              <span class="model-label">{{ $t('agent.model') }}:</span>
              <n-select
                v-model:value="selectedModels[agent.id]"
                :options="modelOptions"
                :placeholder="$t('agent.selectModel')"
                style="width: 360px"
                :consistent-menu-width="false"
                size="small"
              />
              <n-button
                type="primary"
                size="small"
                :disabled="!selectedModels[agent.id] || selectedModels[agent.id] === agent.model"
                :loading="savingAgents[agent.id]"
                @click="saveAgentModel(agent)"
              >
                {{ $t('agent.save') }}
              </n-button>
            </div>

            <div class="agent-footer" v-if="agent.skills && agent.skills.length > 0">
              <span class="meta-label">{{ $t('agent.skills') }}:</span>
              <n-space :size="4">
                <n-tag v-for="s in agent.skills" :key="s" size="tiny" :bordered="false">
                  {{ s }}
                </n-tag>
              </n-space>
            </div>
          </n-card>

          <!-- 子 agent 列表（树形缩进） -->
          <div v-if="agent.children && agent.children.length > 0" class="children-list">
            <div v-for="(child, ci) in agent.children" :key="child.id" class="child-row">
              <div class="tree-line" :class="{ 'last-child': ci === agent.children.length - 1 }">
                <span class="tree-connector">├──</span>
              </div>
              <n-card class="agent-card child-card" size="small">
                <div class="agent-header child-header">
                  <span class="agent-emoji">{{ child.emoji }}</span>
                  <div>
                    <div class="agent-name">
                      <strong>{{ child.name }}</strong>
                      <n-tag size="tiny" :bordered="false" type="default">
                        {{ $t('agent.agentMdType') }}
                      </n-tag>
                    </div>
                    <div class="agent-model-inherited">
                      <span class="meta-label">{{ $t('agent.model') }}:</span>
                      <span class="inherited-text">
                        {{ $t('agent.inheritedFrom', { agent: child.inheritedFrom }) }}
                      </span>
                      <code class="inherited-model">({{ child.model }})</code>
                    </div>
                  </div>
                </div>
              </n-card>
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useNotification } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import api from '@/api';

const notification = useNotification();
const { t } = useI18n();

const loading = ref(true);
const error = ref('');

// Agent 列表 + 可用模型
const agents = ref([]);
const models = ref([]);
const modelOptions = computed(() =>
  models.value.map((m) => ({
    label: `${m.name} (${m.key})`,
    value: m.key,
  }))
);

// 每个 agent 当前选中的模型
const selectedModels = reactive({});
// 保存中状态
const savingAgents = reactive({});

async function fetchAgents() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/agents');
    agents.value = res.data.agents;
    models.value = res.data.models || [];

    // 初始化选中模型
    for (const agent of agents.value) {
      selectedModels[agent.id] = agent.model;
    }
  } catch (err) {
    error.value = err.response?.data?.error || t('agent.fetchFailed');
  } finally {
    loading.value = false;
  }
}

async function saveAgentModel(agent) {
  const newModel = selectedModels[agent.id];
  if (!newModel || newModel === agent.model) return;

  savingAgents[agent.id] = true;
  try {
    const res = await api.put(`/agents/${agent.id}/model`, { model: newModel });
    agent.model = newModel;
    agent.configuredModel = newModel;
    agent.inheritsModel = false;
    notification.success({
      title: t('agent.saveSuccess'),
      content: res.data.message || t('agent.modelUpdated', { agent: agent.name, model: newModel }),
      duration: 3000,
    });
  } catch (err) {
    notification.error({
      title: t('agent.saveFailed'),
      content: err.response?.data?.error || t('common.operationFailed'),
      duration: 3000,
    });
    // 恢复原值
    selectedModels[agent.id] = agent.model;
  } finally {
    savingAgents[agent.id] = false;
  }
}

onMounted(fetchAgents);
</script>

<style scoped>
.agents-page {
  max-width: 860px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2225;
  margin: 0 0 24px;
}

.loading-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-card,
.empty-card {
  margin-top: 24px;
}

.agent-group {
  margin-bottom: 16px;
}

.agent-card {
  border: 1px solid #E0E0E6;
}

.parent-card {
  border-left: 3px solid #2080F0;
}

.child-card {
  border-left: 3px solid #C2C2C2;
  background: #FAFBFC;
}

.agent-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.agent-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.agent-emoji {
  font-size: 24px;
  line-height: 1;
}

.agent-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.agent-identity-name {
  font-size: 13px;
  color: #50555A;
  font-weight: 400;
}

.agent-meta {
  margin-top: 4px;
  font-size: 13px;
}

.meta-label {
  color: #909399;
}

.agent-meta code,
.inherited-model {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  background: #F0F0F6;
  padding: 2px 8px;
  border-radius: 4px;
  color: #50555A;
}

.agent-model-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-label {
  font-size: 13px;
  color: #50555A;
  min-width: 40px;
}

.agent-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #F0F0F6;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

/* 子 agent 树形结构 */
.children-list {
  margin-left: 24px;
  border-left: 2px solid #E0E0E6;
  padding-left: 0;
}

.child-row {
  display: flex;
  align-items: stretch;
}

.tree-line {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.tree-connector {
  color: #C2C2C2;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  margin-left: 2px;
}

.child-row .agent-card {
  flex: 1;
  margin-bottom: 0;
  margin-top: 8px;
}

.child-header {
  align-items: center;
}

.agent-model-inherited {
  margin-top: 2px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.inherited-text {
  color: #909399;
  font-style: italic;
}

.inherited-model {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
</style>
