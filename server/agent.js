const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { applyPatch } = require('./patcher');
const { getRawProviders } = require('./config');

/**
 * Agent 管理业务逻辑
 */

// 读取所有 agent（含子 agent 树形结构）
function getAgents() {
  // 1. 读取 agents.list 配置
  const raw = execSync('openclaw config get agents.list', {
    encoding: 'utf8', timeout: 5000,
  }).trim();
  const agentsList = raw ? JSON.parse(raw) : [];

  // 2. 读取全局默认模型
  let defaultPrimary = '';
  try {
    defaultPrimary = execSync('openclaw config get agents.defaults.model.primary', {
      encoding: 'utf8', timeout: 5000,
    }).trim().replace(/^"|"$/g, '');
  } catch (_) {}

  // 3. 主 workspace 和默认 workspace
  const mainWorkspace = '/home/joker/.openclaw/workspace';
  let defaultWorkspace = mainWorkspace;
  try {
    const dw = execSync('openclaw config get agents.defaults.workspace', {
      encoding: 'utf8', timeout: 5000,
    }).trim().replace(/^"|"$/g, '');
    if (dw) defaultWorkspace = dw;
  } catch (_) {}

  // 4. 构建 agent 列表（含子agent）
  const agents = agentsList.map((agent, index) => {
    const hasExplicitModel = typeof agent.model === 'string'
      || (agent.model && typeof agent.model === 'object');
    const effectiveModel = hasExplicitModel
      ? (typeof agent.model === 'string' ? agent.model : agent.model.primary)
      : defaultPrimary;

    const identity = agent.identity || {
      name: agent.name || agent.id,
      emoji: '🤖',
      theme: 'default',
    };

    // 扫描该 agent workspace 下的子 agent
    let children = [];
    const ws = agent.workspace || (agent.id === 'main' ? mainWorkspace : null);
    if (ws) {
      children = scanSubAgents(ws, effectiveModel, agent.id);
    }

    return {
      id: agent.id,
      name: agent.name || agent.id,
      identity,
      model: effectiveModel,
      configuredModel: hasExplicitModel
        ? (typeof agent.model === 'string' ? agent.model : agent.model.primary)
        : null,
      inheritsModel: !hasExplicitModel,
      defaultModel: defaultPrimary,
      workspace: agent.workspace || (agent.id === 'main' ? defaultWorkspace : null),
      agentDir: agent.agentDir || null,
      skills: agent.skills || [],
      arrayIndex: index,
      children,
    };
  });

  return agents;
}

// 扫描 workspace/agents/ 下的 AGENT.md 文件
function scanSubAgents(workspacePath, parentModel, parentId) {
  const agentsDir = path.join(workspacePath, 'agents');
  if (!fs.existsSync(agentsDir)) return [];

  let files;
  try {
    files = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  } catch (_) {
    return [];
  }

  return files.map((f) => {
    const name = f.replace('.md', '');
    const content = fs.readFileSync(path.join(agentsDir, f), 'utf8');
    const { displayName, emoji } = parseAgentMd(content);
    return {
      id: name,
      name: displayName || name,
      emoji,
      type: 'AGENT.md',
      model: parentModel,
      inheritedFrom: parentId,
      isSubAgent: true,
    };
  });
}

// 解析 AGENT.md 获取元数据
function parseAgentMd(content) {
  const lines = content.split('\n');
  let displayName = '';
  let emoji = '📄';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      const title = line.replace(/^#\s+/, '');
      // 提取 emoji
      const emoMatch = title.match(/([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{200D}]+)/u);
      if (emoMatch) emoji = emoMatch[0];
      // 名称：去掉 emoji 后的文本
      displayName = title.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{200D}]+/gu, '')
        .replace(/—|–|-|\|/g, '').trim();
      break;
    }
  }

  // 清理后缀（如 "— AGENT.md"）
  displayName = displayName.replace(/\bAGENT\.md\b/gi, '').replace(/\s+/g, ' ').trim();

  return { displayName: displayName || 'Unknown', emoji };
}

// 获取可用模型列表（供前端下拉）
function getAvailableModels() {
  const providers = getRawProviders();
  const models = [];
  for (const [providerId, p] of Object.entries(providers)) {
    for (const m of (p.models || [])) {
      models.push({
        key: `${providerId}/${m.id}`,
        provider: providerId,
        model: m.id,
        name: m.name || m.id,
      });
    }
  }
  return models;
}

// 修改 agent 模型
async function updateAgentModel(agentId, newModel) {
  // 读取 agents.list 找到数组索引
  const raw = execSync('openclaw config get agents.list', {
    encoding: 'utf8', timeout: 5000,
  }).trim();
  const agentsList = raw ? JSON.parse(raw) : [];

  const index = agentsList.findIndex((a) => a.id === agentId);
  if (index === -1) {
    return { success: false, error: `Agent "${agentId}" 不在配置列表中` };
  }

  // 通过数组索引 patch
  const patch = {
    agents: {
      list: {
        [String(index)]: { model: newModel },
      },
    },
  };

  return applyPatch(patch);
}

module.exports = {
  getAgents,
  getAvailableModels,
  updateAgentModel,
};
