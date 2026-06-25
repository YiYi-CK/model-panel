const { getProviders, getProvider, getRawProvider } = require('./config');
const { upsertProvider, deleteProvider: deleteProviderPatch } = require('./patcher');

/**
 * Provider CRUD 业务逻辑
 */

// 列出所有 provider
async function list(req, res) {
  try {
    const providers = getProviders();
    // 转换为数组并附加统计信息
    const list = Object.entries(providers).map(([id, p]) => ({
      id,
      ...p,
      modelCount: (p.models || []).length,
    }));
    res.json({ providers: list });
  } catch (err) {
    console.error('[Provider list error]', err.message);
    res.status(500).json({ error: '获取 Provider 列表失败' });
  }
}

// 获取单个 provider 详情
async function get(req, res) {
  try {
    const { id } = req.params;
    // ID 合法性校验
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(id)) {
      return res.status(400).json({ error: '无效的 Provider ID' });
    }
    const provider = getProvider(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }
    provider.id = id;
    provider.modelCount = (provider.models || []).length;
    res.json({ provider });
  } catch (err) {
    console.error('[Provider get error]', err.message);
    res.status(500).json({ error: '获取 Provider 详情失败' });
  }
}

// 添加 provider
async function create(req, res) {
  try {
    const { id, baseUrl, api, apiKey, auth, region, timeoutSeconds } = req.body;

    // 校验必填字段
    if (!id || !/^[a-zA-Z0-9_.-]{2,64}$/.test(id)) {
      return res.status(400).json({ error: 'Provider ID 格式不正确（2-64 字符，字母数字连字符）' });
    }
    if (!baseUrl || !/^https?:\/\/.+/.test(baseUrl)) {
      return res.status(400).json({ error: 'Base URL 格式不正确（需以 http:// 或 https:// 开头）' });
    }
    if (!api) {
      return res.status(400).json({ error: '请选择 API Type' });
    }

    // 检查是否已存在
    const existing = getRawProvider(id);
    if (existing) {
      return res.status(409).json({ error: `Provider "${id}" 已存在` });
    }

    // 构建 provider 数据
    const providerData = {
      baseUrl,
      api,
      models: [],
    };
    if (apiKey) providerData.apiKey = apiKey;
    if (auth) providerData.auth = auth;
    if (region) providerData.region = region;
    if (timeoutSeconds) providerData.timeoutSeconds = timeoutSeconds;

    const result = await upsertProvider(id, providerData);
    if (!result.success) {
      return res.status(400).json({ error: `配置写入失败: ${result.error}` });
    }

    res.status(201).json({ ok: true, message: `Provider "${id}" 创建成功` });
  } catch (err) {
    console.error('[Provider create error]', err.message);
    res.status(500).json({ error: '添加 Provider 失败' });
  }
}

// 编辑 provider
async function update(req, res) {
  try {
    const { id } = req.params;
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(id)) {
      return res.status(400).json({ error: '无效的 Provider ID' });
    }

    const existing = getRawProvider(id);
    if (!existing) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }

    const { baseUrl, api, apiKey, auth, region, timeoutSeconds } = req.body;

    // 合并：保留旧值，仅更新传入的字段
    const updated = { ...existing };
    if (baseUrl !== undefined) {
      if (!/^https?:\/\/.+/.test(baseUrl)) {
        return res.status(400).json({ error: 'Base URL 格式不正确' });
      }
      updated.baseUrl = baseUrl;
    }
    if (api !== undefined) updated.api = api;
    // apiKey: 只有传了非空值才更新（空字符串表示不修改）
    if (apiKey !== undefined && apiKey !== '') {
      updated.apiKey = apiKey;
    }
    if (auth !== undefined) updated.auth = auth || undefined;
    if (region !== undefined) updated.region = region || undefined;
    if (timeoutSeconds !== undefined) updated.timeoutSeconds = timeoutSeconds || undefined;

    const result = await upsertProvider(id, updated);
    if (!result.success) {
      return res.status(400).json({ error: `配置写入失败: ${result.error}` });
    }

    res.json({ ok: true, message: `Provider "${id}" 更新成功` });
  } catch (err) {
    console.error('[Provider update error]', err.message);
    res.status(500).json({ error: '编辑 Provider 失败' });
  }
}

// 删除 provider
async function remove(req, res) {
  try {
    const { id } = req.params;
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(id)) {
      return res.status(400).json({ error: '无效的 Provider ID' });
    }

    const existing = getRawProvider(id);
    if (!existing) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }

    const result = await deleteProviderPatch(id);
    if (!result.success) {
      return res.status(400).json({ error: `删除失败: ${result.error}` });
    }

    res.json({ ok: true, message: `Provider "${id}" 已删除` });
  } catch (err) {
    console.error('[Provider delete error]', err.message);
    res.status(500).json({ error: '删除 Provider 失败' });
  }
}

module.exports = { list, get, create, update, remove };
