const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const { authenticate } = require('./auth');
const { requireAuth, errorHandler, SESSION_MAX_AGE, REMEMBER_ME_MAX_AGE } = require('./middleware');
const { getDashboard, getRawProviders } = require('./config');
const { applyPatch } = require('./patcher');
const providerController = require('./provider');
const modelController = require('./model');
const { testConnection } = require('./util');
const { getAgents, getAvailableModels, updateAgentModel } = require('./agent');

const app = express();
const PORT = process.env.PORT || 3020;

// ──────────────────────────────────────────────
// 中间件
// ──────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Session 配置
// 生成或复用 session secret（优先使用环境变量，否则随机生成）
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // 内网 HTTP
    maxAge: SESSION_MAX_AGE,
  },
}));

// ──────────────────────────────────────────────
// 认证路由（无需 session）
// ──────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password, rememberMe } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: '请输入用户名和密码' });
  }

  try {
    const result = await authenticate(username, password);
    if (!result.success) {
      return res.status(401).json({ ok: false, error: '用户名或密码错误' });
    }

    // 创建 session
    req.session.authenticated = true;
    req.session.username = username;
    req.session.expiresAt = Date.now() + (rememberMe ? REMEMBER_ME_MAX_AGE : SESSION_MAX_AGE);

    // 设置 cookie maxAge
    req.session.cookie.maxAge = rememberMe ? REMEMBER_ME_MAX_AGE : SESSION_MAX_AGE;

    res.json({ ok: true, user: username, sessionExpires: req.session.cookie.maxAge });
  } catch (err) {
    console.error('[Login error]', err.message);
    res.status(500).json({ ok: false, error: '认证服务异常，请稍后重试' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: '登出失败' });
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// ──────────────────────────────────────────────
// Session 状态检查
// ──────────────────────────────────────────────
app.get('/api/status', requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    user: req.session.username,
    expiresAt: req.session.expiresAt,
  });
});

// Dashboard 数据
app.get('/api/dashboard', requireAuth, (req, res) => {
  try {
    const dashboard = getDashboard();
    res.json(dashboard);
  } catch (err) {
    console.error('[Dashboard error]', err.message);
    res.status(500).json({ error: '获取仪表盘数据失败' });
  }
});

// ──────────────────────────────────────────────
// Provider 路由
// ──────────────────────────────────────────────
app.get('/api/providers', requireAuth, providerController.list);
app.post('/api/providers', requireAuth, providerController.create);
app.get('/api/providers/:id', requireAuth, providerController.get);
app.put('/api/providers/:id', requireAuth, providerController.update);
app.delete('/api/providers/:id', requireAuth, providerController.remove);

// ──────────────────────────────────────────────
// Model 路由（嵌套在 provider 下）
// ──────────────────────────────────────────────
app.get('/api/providers/:id/models', requireAuth, modelController.list);
app.post('/api/providers/:id/models', requireAuth, modelController.create);
app.post('/api/providers/:id/models/import', requireAuth, modelController.importModels);
app.get('/api/providers/:id/models/:mid', requireAuth, modelController.get);
app.put('/api/providers/:id/models/:mid', requireAuth, modelController.update);
app.delete('/api/providers/:id/models/:mid', requireAuth, modelController.remove);

// ──────────────────────────────────────────────
// Agent 路由
// ──────────────────────────────────────────────
app.get('/api/agents', requireAuth, (req, res) => {
  try {
    const agents = getAgents();
    const models = getAvailableModels();
    res.json({ agents, models });
  } catch (err) {
    console.error('[Agents list error]', err.message);
    res.status(500).json({ error: '获取 Agent 列表失败' });
  }
});

app.put('/api/agents/:id/model', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { model } = req.body;

  if (!model || typeof model !== 'string' || !model.includes('/')) {
    return res.status(400).json({ error: '模型格式不正确（格式: provider/model-id）' });
  }

  // ID 合法性校验
  if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(id)) {
    return res.status(400).json({ error: '无效的 Agent ID' });
  }

  try {
    const result = await updateAgentModel(id, model);
    if (!result.success) {
      return res.status(400).json({ error: `设置失败: ${result.error}` });
    }
    res.json({ ok: true, message: `Agent "${id}" 模型已更新至 ${model}` });
  } catch (err) {
    console.error('[Agent model update error]', err.message);
    res.status(500).json({ error: '修改 Agent 模型失败' });
  }
});

// ──────────────────────────────────────────────
// 工具路由
// ──────────────────────────────────────────────
app.post('/api/test-connection', requireAuth, async (req, res) => {
  const { baseUrl } = req.body;
  if (!baseUrl) {
    return res.status(400).json({ error: '请提供 URL' });
  }
  try {
    const result = await testConnection(baseUrl);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// 默认模型管理
// ──────────────────────────────────────────────

// 获取所有可用模型列表（供下拉选择）
app.get('/api/models', requireAuth, (req, res) => {
  try {
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
    res.json({ models });
  } catch (err) {
    console.error('[Models list error]', err.message);
    res.status(500).json({ error: '获取模型列表失败' });
  }
});

// 设置默认模型
app.put('/api/default-model', requireAuth, async (req, res) => {
  const { model } = req.body;
  if (!model || typeof model !== 'string' || !model.includes('/')) {
    return res.status(400).json({ error: '模型格式不正确（格式: provider/model-id）' });
  }

  try {
    const patch = {
      agents: {
        defaults: {
          model: { primary: model },
        },
      },
    };
    const result = await applyPatch(patch);
    if (!result.success) {
      return res.status(400).json({ error: `设置失败: ${result.error}` });
    }
    res.json({ ok: true, message: `默认模型已切换至 ${model}` });
  } catch (err) {
    console.error('[Set default model error]', err.message);
    res.status(500).json({ error: '设置默认模型失败' });
  }
});

// ──────────────────────────────────────────────
// 静态文件 + SPA fallback
// ──────────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  // 不让 API 路径走 SPA fallback
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API 路径不存在' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ──────────────────────────────────────────────
// 错误处理
// ──────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🦊 OpenClaw 模型管理面板已启动 → http://localhost:${PORT}`);
});
