const { getRawProvider, getRawProviders } = require('./config');
const { setProviderModels, upsertProvider } = require('./patcher');

/**
 * Model CRUD 业务逻辑（嵌套在 Provider 下）
 */

// 列出 provider 下所有 model
async function list(req, res) {
  try {
    const { id } = req.params;
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(id)) {
      return res.status(400).json({ error: '无效的 Provider ID' });
    }

    const provider = getRawProvider(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }

    const models = provider.models || [];
    res.json({ models });
  } catch (err) {
    console.error('[Model list error]', err.message);
    res.status(500).json({ error: '获取 Model 列表失败' });
  }
}

// 获取单个 model
async function get(req, res) {
  try {
    const { id, mid } = req.params;
    const provider = getRawProvider(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }
    const models = provider.models || [];
    const model = models.find((m) => m.id === mid);
    if (!model) {
      return res.status(404).json({ error: 'Model 不存在' });
    }
    res.json({ model });
  } catch (err) {
    console.error('[Model get error]', err.message);
    res.status(500).json({ error: '获取 Model 详情失败' });
  }
}

// 添加 model
async function create(req, res) {
  try {
    const { id } = req.params;
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(id)) {
      return res.status(400).json({ error: '无效的 Provider ID' });
    }

    const provider = getRawProvider(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }

    const modelData = req.body;

    // 校验必填字段
    if (!modelData.id || !/^[a-zA-Z0-9_.-]{2,64}$/.test(modelData.id)) {
      return res.status(400).json({ error: 'Model ID 格式不正确（2-64 字符，字母数字连字符）' });
    }

    const models = provider.models || [];

    // 检查重复
    if (models.some((m) => m.id === modelData.id)) {
      return res.status(409).json({ error: `Model "${modelData.id}" 已存在` });
    }

    // 构建 model 对象
    const newModel = buildModelObject(modelData);
    models.push(newModel);

    const result = await setProviderModels(id, models);
    if (!result.success) {
      return res.status(400).json({ error: `配置写入失败: ${result.error}` });
    }

    res.status(201).json({ ok: true, message: `Model "${modelData.id}" 添加成功` });
  } catch (err) {
    console.error('[Model create error]', err.message);
    res.status(500).json({ error: '添加 Model 失败' });
  }
}

// 编辑 model
async function update(req, res) {
  try {
    const { id, mid } = req.params;
    const provider = getRawProvider(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }

    const models = provider.models || [];
    const idx = models.findIndex((m) => m.id === mid);
    if (idx === -1) {
      return res.status(404).json({ error: 'Model 不存在' });
    }

    // 合并更新
    const updated = { ...models[idx], ...buildModelObject(req.body, true) };
    // 保留 id 不变
    updated.id = mid;
    models[idx] = updated;

    const result = await setProviderModels(id, models);
    if (!result.success) {
      return res.status(400).json({ error: `配置写入失败: ${result.error}` });
    }

    res.json({ ok: true, message: `Model "${mid}" 更新成功` });
  } catch (err) {
    console.error('[Model update error]', err.message);
    res.status(500).json({ error: '编辑 Model 失败' });
  }
}

// 删除 model
async function remove(req, res) {
  try {
    const { id, mid } = req.params;
    const provider = getRawProvider(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }

    const models = provider.models || [];
    const idx = models.findIndex((m) => m.id === mid);
    if (idx === -1) {
      return res.status(404).json({ error: 'Model 不存在' });
    }

    models.splice(idx, 1);

    const result = await setProviderModels(id, models);
    if (!result.success) {
      return res.status(400).json({ error: `删除失败: ${result.error}` });
    }

    res.json({ ok: true, message: `Model "${mid}" 已删除` });
  } catch (err) {
    console.error('[Model delete error]', err.message);
    res.status(500).json({ error: '删除 Model 失败' });
  }
}

// 批量导入 model
async function importModels(req, res) {
  try {
    const { id } = req.params;
    const provider = getRawProvider(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider 不存在' });
    }

    const { models: newModels } = req.body;
    if (!Array.isArray(newModels) || newModels.length === 0) {
      return res.status(400).json({ error: '请提供有效的 Model 列表' });
    }

    // 校验每个 model
    for (const m of newModels) {
      if (!m.id || !/^[a-zA-Z0-9_.-]{2,64}$/.test(m.id)) {
        return res.status(400).json({ error: `Model "${m.id || '?'}" ID 格式不正确` });
      }
    }

    const existingModels = provider.models || [];
    const existingIds = new Set(existingModels.map((m) => m.id));

    // 检查重复
    const duplicates = newModels.filter((m) => existingIds.has(m.id));
    if (duplicates.length > 0) {
      return res.status(409).json({
        error: `以下 Model ID 已存在: ${duplicates.map((m) => m.id).join(', ')}`,
      });
    }

    // 构建 model 对象
    const builtModels = newModels.map((m) => buildModelObject(m));
    const allModels = [...existingModels, ...builtModels];

    const result = await setProviderModels(id, allModels);
    if (!result.success) {
      return res.status(400).json({ error: `导入失败: ${result.error}` });
    }

    res.status(201).json({ ok: true, message: `成功导入 ${newModels.length} 个模型` });
  } catch (err) {
    console.error('[Model import error]', err.message);
    res.status(500).json({ error: '批量导入失败' });
  }
}

// 根据表单数据构建 model 对象
function buildModelObject(data, isUpdate = false) {
  const model = {};

  if (data.id && !isUpdate) model.id = data.id;
  if (data.name && data.name !== data.id) model.name = data.name;
  if (data.api) model.api = data.api;
  if (data.reasoning !== undefined) model.reasoning = data.reasoning;
  if (data.input && data.input.length > 0) model.input = data.input;
  if (data.contextWindow) model.contextWindow = Number(data.contextWindow);
  if (data.maxTokens) model.maxTokens = Number(data.maxTokens);

  // cost: 只有非零值才写入
  if (data.cost) {
    const cost = {};
    if (data.cost.input > 0) cost.input = Number(data.cost.input);
    if (data.cost.output > 0) cost.output = Number(data.cost.output);
    if (data.cost.cacheRead > 0) cost.cacheRead = Number(data.cost.cacheRead);
    if (data.cost.cacheWrite > 0) cost.cacheWrite = Number(data.cost.cacheWrite);
    if (Object.keys(cost).length > 0) model.cost = cost;
    else if (isUpdate) model.cost = null; // 清空
  }

  return model;
}

module.exports = { list, get, create, update, remove, importModels };
