# Phase 2: 架构设计 — OpenClaw 模型管理面板

> **项目类型:** SaaS/Web App → Phase 3 深度 ⭐⭐⭐
> **目标:** 完成页面结构、数据建模、路由表、组件树设计

---

## 1️⃣ 页面结构

```
/login                        ─ PAM 登录页面
/dashboard                    ─ 配置概览（首页）
/providers                    ─ Provider 列表
/providers/:id                ─ Provider 详情 + Model 列表
/providers/:id/models         ─ Model 列表（重定向到 :id）
/providers/:id/models/:mid    ─ Model 编辑（弹窗/抽屉实现，实际不需要独立路由）
```

**页面关系图：**

```
                    ┌──────────────┐
                    │   /login     │
                    │  PAM 登录    │
                    └──────┬───────┘
                           │ 登录成功
                    ┌──────▼───────┐
                    │  /dashboard  │ ← 首页
                    │  配置概览    │
                    └──┬───────┬───┘
                       │       │
              ┌────────▼──┐ ┌──▼────────────┐
              │ /providers│ │ /providers/:id │
              │ 列表页    │ │ 详情+Model管理 │
              └───────────┘ └────────────────┘
```

---

## 2️⃣ 用户角色

| 角色 | 权限 |
|------|------|
| **authenticated** | 所有功能：查看配置、添加/删除/编辑 Provider、添加/删除/编辑 Model |
| **unauthenticated** | 仅登录页面，所有 API 请求返回 401 |

> 单角色系统。PAM 验证通过即拥有所有权限，无细分。

---

## 3️⃣ 数据/内容建模

### 3.1 前端状态模型

```typescript
// 用户会话
interface UserSession {
  authenticated: boolean;
  username: string;
  expiresAt: number;        // epoch ms
}

// Provider（来自 openclaw models.providers 配置）
interface Provider {
  id: string;                // provider key, e.g. "deepseek"
  baseUrl: string;           // "https://api.deepseek.com"
  api: string;               // "openai-completions" | "anthropic-messages" | "google-gemini"
  apiKey: string | null;     // 脱敏展示 "sk-...xxxx"
  auth?: string;             // "api-key" | "token" | "oauth" | "aws-sdk"
  region?: string;
  timeoutSeconds?: number;
  contextWindow?: number;
  maxTokens?: number;
  headers?: Record<string, string>;
  models: Model[];           // 该 provider 下的模型列表
  modelCount: number;        // 计算属性
}

// Model（来自 models.providers.*.models 数组元素）
interface Model {
  id: string;                // "deepseek-v4-flash"
  name: string;              // "DeepSeek V4 Flash"
  api?: string;              // 不填继承 provider.api
  reasoning: boolean;
  input: string[];           // ["text"] | ["text","image"] | ["text","image","audio"]
  contextWindow: number;     // 1000000
  maxTokens: number;         // 384000
  cost?: {
    input: number;           // $/M tokens
    output: number;          // $/M tokens
    cacheRead?: number;      // $/M tokens
    cacheWrite?: number;     // $/M tokens
  };
  compat?: {
    supportsReasoningEffort?: boolean;
    supportsUsageInStreaming?: boolean;
    maxTokensField?: string;
  };
}

// Dashboard
interface Dashboard {
  mode: string;              // "merge" | "replace"
  providerCount: number;
  totalModelCount: number;
  defaultModel: string;      // "deepseek/deepseek-v4-flash"
  configHash: string;        // sha256
  gatewayStatus: string;     // "running" | "unknown"
}
```

### 3.2 后端数据流

```
┌─────────┐      ┌──────────────┐      ┌──────────────┐
│  Vue 3  │──→──│  Express API  │──→──│  OpenClaw CLI │
│  Front  │←────│  Backend      │←────│  config get   │
└─────────┘      └──────┬───────┘      └──────────────┘
                        │
                        │ 写入配置
                 ┌──────▼───────┐
                 │  OpenClaw CLI│
                 │  config patch│
                 │  --stdin     │
                 └──────┬───────┘
                        │ 校验 + 写入 + 热重载
                 ┌──────▼───────┐
                 │ openclaw.json│
                 └──────────────┘
```

**关键原则：后端不直接读写 openclaw.json。所有配置操作通过 `openclaw config` CLI。**

---

## 4️⃣ 路由表

### 4.1 Vue Router（前端）

```javascript
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }           // 已登录则重定向到 dashboard
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/providers',
    name: 'Providers',
    component: () => import('@/views/Providers.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/providers/:id',
    name: 'ProviderDetail',
    component: () => import('@/views/ProviderDetail.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'           // 兜底重定向到首页
  }
];
```

### 4.2 Express Router（后端 API）

```javascript
// 认证路由（无需 session）
router.post('/api/auth/login',    authController.login);
router.post('/api/auth/logout',   authController.logout);

// 需要 session 校验（中间件）
router.get   ('/api/status',      authController.status);

// Provider 路由
router.get   ('/api/providers',   providerController.list);
router.post  ('/api/providers',   providerController.create);
router.get   ('/api/providers/:id', providerController.get);
router.put   ('/api/providers/:id', providerController.update);
router.delete('/api/providers/:id', providerController.remove);

// Model 路由（嵌套在 provider 下）
router.get   ('/api/providers/:id/models',      modelController.list);
router.post  ('/api/providers/:id/models',      modelController.create);
router.post  ('/api/providers/:id/models/import', modelController.import);
router.get   ('/api/providers/:id/models/:mid', modelController.get);
router.put   ('/api/providers/:id/models/:mid', modelController.update);
router.delete('/api/providers/:id/models/:mid', modelController.remove);

// 工具路由
router.post  ('/api/test-connection', utilController.testConnection);

// 静态文件（Vite build 产物）
app.use(express.static(path.join(__dirname, '../dist')));
// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

---

## 5️⃣ 组件树（原子设计 BAMO）

### 5.1 Atoms（原子组件 - 最小不可分单元）

```
AppLogo           ─ 应用 Logo
PageTitle         ─ 页面标题
FormInput         ─ 表单输入框（通用）
FormSelect        ─ 下拉选择器
FormSwitch        ─ 开关组件
FormNumber        ─ 数字输入
FormTags          ─ 标签多选（input types: text/image/audio）
ApiKeyDisplay     ─ API Key 脱敏展示（sk-...xxxx + 复制按钮）
StatusBadge       ─ 状态标签（running/error）
EmptyState        ─ 空状态占位
LoadingSpinner    ─ 加载中
ConfirmDialog     ─ 确认弹窗（通用）
BackButton        ─ 返回按钮
CopyButton        ─ 复制按钮（点击复制到剪贴板）
```

### 5.2 Molecules（分子组件 - 原子组合）

```
NavBar            ─ 顶部导航栏（Logo + 用户名 + 登出）
SessionGuard      ─ 路由守卫（无 session → /login）
ProviderCard      ─ Provider 卡片（ID + URL + 模型数 + 快捷操作）
ModelRow          ─ Model 行（ID + Name + Context Window + Cost 摘要）
ModelForm         ─ Model 表单（添加/编辑共用）
ProviderForm      ─ Provider 表单（添加/编辑共用）
CostForm          ─ 成本填写面板（折叠展开）
TestConnection   ─ 连接测试按钮 + 结果展示
ProviderSelector  ─ Provider 下拉选择（用于跳转）
```

### 5.3 Organisms（有机体组件 - 分子组合）

```
LoginForm         ─ 登录表单（用户名 + 密码 + 记住我 + 提交）
ProviderList      ─ Provider 列表 + 添加按钮 + 搜索
ProviderDetail    ─ Provider 详情卡片 + Model 列表
ModelList         ─ Model 表格（排序 + 搜索 + 操作列）
ModelDrawer       ─ Model 编辑/添加抽屉（Naive UI Drawer）
ProviderDrawer    ─ Provider 编辑/添加抽屉
DashboardCards    ─ 概览卡片组（Provider数 / Model数 / Gateway状态 / 配置Hash）
ImportDrawer      ─ 批量导入 JSON 文本框 + 预览 + 确认
```

### 5.4 Templates（模板组件 - 页面布局）

```
GuestLayout       ─ 登录页布局（居中卡片）
MainLayout        ─ 主布局（NavBar + 侧边栏 + 内容区）
ConfigLayout      ─ 配置管理布局（面包屑 + 内容区）
```

---

## 6️⃣ 后端模块架构

```
server/
├── index.js              ─ Express 入口
├── config.js             ─ 读取 OpenClaw 配置（调用 CLI）
├── patcher.js            ─ 执行 config patch（调用 CLI）
├── auth.js               ─ PAM 认证 + Session 管理
├── middleware.js          ─ 认证中间件 + 错误处理
├── provider.js           ─ Provider CRUD 业务逻辑
├── model.js              ─ Model CRUD 业务逻辑
└── util.js               ─ 测试连接 + 格式校验
```

### 6.1 config.js — 配置读取

```javascript
// 内部: 调用 openclaw config get <path>
// 读取 providers 时自动脱敏 apiKey 字段
// 返回 JSON 对象给前端
function getProviders() {
  const raw = execSync('openclaw config get models.providers', { encoding: 'utf8' });
  const providers = JSON.parse(raw);
  return sanitizeProviders(providers);  // 脱敏 apiKey
}
```

### 6.2 patcher.js — 配置写入

```javascript
// 内部: 构建 JSON patch → 管道到 openclaw config patch --stdin
function applyPatch(patch) {
  const child = spawn('openclaw', ['config', 'patch', '--stdin']);
  child.stdin.write(JSON.stringify(patch));
  child.stdin.end();
  // 等待 stdout/stderr 结果
  // 返回 { success: boolean, error?: string }
}
```

### 6.3 auth.js — PAM 认证

```javascript
// 使用 authenticate-pam 包
// 验证成功后创建 session
// 记住我: 设置 24h maxAge，否则 1h
function authenticate(username, password, rememberMe) {
  return pam.authenticate(username, password);
  // 失败: 返回 false
  // 成功: 创建 session
}
```

---

## 7️⃣ 后端安全设计

| 层 | 措施 |
|----|------|
| **Session** | HttpOnly Cookie, SameSite=Lax |
| **PAM** | 密码不落盘，不存任何痕迹，直接调 PAM API |
| **API Key** | 读取时自动脱敏，写入时通过 stdin 管道不落盘 |
| **错误处理** | 所有异常统一捕获，不泄露调用栈 |
| **Rate Limit** | 登录接口：5 次/分钟（防暴力破解） |

---

## 8️⃣ 构建与部署

```
开发环境:
  cd model-panel
  npm run dev          → Vite dev server (port 5173) + API proxy → port 3020

生产构建:
  npm run build        → Vite build → dist/
  node server/index.js  → Express 静态服务 port 3020

PM2 守护:
  pm2 start server/index.js --name model-panel --cwd model-panel/
```
