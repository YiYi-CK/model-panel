const { execSync } = require('child_process');
const crypto = require('crypto');

/**
 * 读取 OpenClaw 配置（通过 CLI），自动脱敏 API Key
 * 绝不直接读写 openclaw.json！
 */

// 获取原始 providers 对象（未脱敏，仅内部使用）
function getRawProviders() {
  const raw = execSync('openclaw config get models.providers', {
    encoding: 'utf8',
    timeout: 5000,
  }).trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

// 脱敏 API Key 展示用
function maskApiKey(key) {
  if (!key || typeof key !== 'string') return null;
  if (key.length <= 8) return '***';
  return key.slice(0, 3) + '-...' + key.slice(-4);
}

// 批量脱敏 providers 中所有 apiKey
function sanitizeProviders(providers) {
  const result = {};
  for (const [id, p] of Object.entries(providers)) {
    result[id] = {
      ...p,
      apiKey: maskApiKey(p.apiKey),
      _hasApiKey: !!p.apiKey, // 前端判断是否已设置
    };
  }
  return result;
}

// 获取脱敏后的 providers 列表（供前端展示）
function getProviders() {
  const raw = getRawProviders();
  return sanitizeProviders(raw);
}

// 获取单个 provider（脱敏）
function getProvider(id) {
  const raw = getRawProviders();
  if (!raw[id]) return null;
  return sanitizeProviders({ [id]: raw[id] })[id];
}

// 获取单个 provider（未脱敏，内部用）
function getRawProvider(id) {
  const raw = getRawProviders();
  return raw[id] || null;
}

// 获取 dashboard 概览信息
function getDashboard() {
  const providers = getRawProviders();
  const providerCount = Object.keys(providers).length;
  let totalModelCount = 0;
  for (const p of Object.values(providers)) {
    totalModelCount += (p.models || []).length;
  }

  // 读取 models.mode
  let mode = 'merge';
  try {
    mode = execSync('openclaw config get models.mode', {
      encoding: 'utf8',
      timeout: 5000,
    }).trim().replace(/^"|"$/g, '');
  } catch (_) {
    // 保持默认值
  }

  // 读取默认模型
  let defaultModel = '';
  try {
    defaultModel = execSync('openclaw config get defaultModel', {
      encoding: 'utf8',
      timeout: 5000,
    }).trim().replace(/^"|"$/g, '');
  } catch (_) {
    // 保持空
  }

  // 计算配置 hash
  const raw = JSON.stringify(getRawProviders());
  const configHash = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);

  return {
    mode,
    providerCount,
    totalModelCount,
    defaultModel,
    configHash,
  };
}

module.exports = {
  getRawProviders,
  getProviders,
  getProvider,
  getRawProvider,
  getDashboard,
  maskApiKey,
};
