# Phase 3: 页面设计 — OpenClaw 模型管理面板

> **项目类型:** SaaS/Web App → Phase 3 深度 ⭐⭐
> **覆盖:** 逐页模块 + 交互流程 + 5 态设计

---

## Page 1: /login — PAM 登录

### 模块布局

```
┌──────────────────────────────────┐
│                                  │
│        🦊 OpenClaw 模型管理      │
│                                  │
│  ┌──────────────────────────────┐│
│  │  用户名  [_______________]  ││
│  │  密码    [_______________]  ││
│  │                              ││
│  │  ☐ 记住我 (24h)             ││
│  │                              ││
│  │  [      登  录      ]       ││
│  └──────────────────────────────┘│
│                                  │
│         yiyi-vm (Ubuntu)         │
└──────────────────────────────────┘

组件: GuestLayout > LoginForm > FormInput × 2 + FormSwitch + Button
```

### 交互流程

```
1. 用户输入用户名 + 密码
2. 点击"登录"或按 Enter
3. 前端: axios POST /api/auth/login
4. 后端: authenticate-pam 验证
   ├─ 成功 → 200 + Set-Cookie session → 前端跳转 /dashboard
   └─ 失败 → 200 { ok: false } → 前端显示错误提示
5. 记住我: 发送 { rememberMe: true }，后端设置 24h maxAge
```

### 5 态设计

| 状态 | 表现 |
|------|------|
| **正常** | 表单可交互，Logo 展示，footer 显示主机名 |
| **空** | 不适用（表单页无空态） |
| **加载** | 登录按钮显示 spinner，"登录中..."，表单禁用 |
| **错误** | Naive UI Notification 顶部弹出："用户名或密码错误"，表单恢复可用 |
| **边缘** | 网络故障: "连接服务器失败，请检查网络" |

### 表单校验（前端）

```
- 用户名为空 → "请输入用户名"
- 密码为空   → "请输入密码"
- 用户名 >32字符 → "用户名过长"
```

---

## Page 2: /dashboard — 配置概览

### 模块布局

```
┌──────────────────────────────────────────────────┐
│  🦊  Model Panel   用户名 ▼            [ 登出 ]  │  ← NavBar
├──────────────────────────────────────────────────┤
│  仪表盘  提供者                                │  ← 侧边栏
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Provider 数  │ │ 总 Model 数 │ │ 配置状态     │ │
│  │      1       │ │      4      │ │ ● 运行中     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                  │
│  ┌─────────────┐ ┌─────────────────────────────┐ │
│  │ 配置模式     │ │ 默认模型                     │ │
│  │ merge       │ │ deepseek/deepseek-v4-flash   │ │
│  └─────────────┘ └─────────────────────────────┘ │
│                                                  │
│  ┌──────────────────────────────────────────────┐│
│  │ 配置文件 Hash: d5fbfacc...                   ││
│  │ 最后修改: 2026-06-25 09:00 UTC               ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘

组件: MainLayout > DashboardCards
```

### 交互流程

```
1. 进入页面 → GET /api/status (校验session) + GET /api/providers (获取数据)
2. 前端聚合统计:
   - Provider 数 = providers.length
   - 总 Model 数 = sum(providers[i].modelCount)
   - 配置 Hash = dashbaord.configHash
   - 默认模型 = dashboard.defaultModel
3. 点击卡片 → 跳转对应页面
```

### 5 态设计

| 状态 | 表现 |
|------|------|
| **正常** | 4 个统计卡片 + 配置信息 |
| **空** | 无 Provider 时 → Provider 数=0，Model 数=0，提示"暂无配置，前往添加" |
| **加载** | 卡片显示 Skeleton（Naive UI Skeleton） |
| **错误** | 加载失败 → "获取配置失败"，重试按钮 |
| **Session 过期** | 返回 401 → 跳转 /login |

---

## Page 3: /providers — Provider 列表

### 模块布局

```
┌──────────────────────────────────────────────────┐
│  🦊  Model Panel                    [ + 添加 ]   │
├──────────────────────────────────────────────────┤
│  ← 仪表盘  提供者                                │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────────┐│
│  │ 🔍 搜索 Provider...                         ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  ┌────────────┬──────────┬──────┬──────────────┐ │
│  │ Provider   │ Base URL │ Model│ 操作         │ │
│  ├────────────┼──────────┼──────┼──────────────┤ │
│  │ deepseek   │ api.deep │ 4    │ 详情 测试 删除│ │
│  │ openai     │ api.open │ 3    │ 详情 测试 删除│ │
│  └────────────┴──────────┴──────┴──────────────┘ │
│                                                  │
│  [ 添加 Provider 弹窗/抽屉 ]                     │
└──────────────────────────────────────────────────┘

组件: MainLayout > ProviderList
```

### 交互流程

```
1. 进入页面 → GET /api/providers
2. 列表展示（Naive UI DataTable）:
   - 点击"详情" → 跳转 /providers/:id
   - 点击"测试" → POST /api/test-connection { baseUrl }
   - 点击"删除" → ConfirmDialog → DELETE /api/providers/:id
3. 添加按钮 → 打开 ProviderDrawer
   - 填写表单（providerId, baseUrl, api, apiKey 等）
   - 点击"测试连接" → 可选先 test 再保存
   - 点击"保存" → POST /api/providers
   - 关闭抽屉 → 刷新列表
```

### 5 态设计

| 状态 | 表现 |
|------|------|
| **正常** | DataTable 展示所有 Provider，带搜索过滤 |
| **空** | NoProvider 插画 + "还没有配置任何 Provider，点击添加" + 添加按钮 |
| **加载** | DataTable Skeleton loading |
| **错误** | "获取 Provider 列表失败" + 重试按钮 |
| **删除中** | 行变灰 + 删除按钮禁用 |
| **添加/编辑失败** | Notification 提示具体错误（如"Provider ID 已存在"） |

---

## Page 4: /providers/:id — Provider 详情 + Model 管理

### 模块布局

```
┌──────────────────────────────────────────────────┐
│  🦊  Model Panel          [ 编辑 Provider ]      │
├──────────────────────────────────────────────────┤
│  ← 仪表盘  ← 提供者                             │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─ Provider 信息 ──────────────────────────────┐│
│  │ deepseek                                      ││
│  │ https://api.deepseek.com                      ││
│  │ API: openai-completions  Auth: api-key        ││
│  │ API Key: sk-...xxxx    [📋][测试连接]        ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  ┌─ Model 列表 ───────────────────[+ 添加][导入]─┐│
│  │ Model ID          │ Ctx    │ Cost     │ 操作  ││
│  ├───────────────────┼────────┼──────────┼───────┤│
│  │ deepseek-v4-flash │ 977k   │ 0.14/0.28│ 编辑  ││
│  │ deepseek-v4-pro   │ 977k   │ 1.74/3.48│ 删除  ││
│  │ deepseek-chat     │ 128k   │ 0.28/0.42│ 编辑  ││
│  │ deepseek-reasoner │ 128k   │ 0.28/0.42│ 删除  ││
│  └──────────────────┴────────┴──────────┴───────┘│
│                                                  │
│  [ Model 添加/编辑 Drawer ]  [ 导入 Drawer ]     │
└──────────────────────────────────────────────────┘

组件: MainLayout > ProviderDetail + ModelList
```

### 交互流程

```
1. 进入页面:
   - GET /api/providers/:id → Provider 详情
   - GET /api/providers/:id/models → Model 列表

2. Provider 操作:
   - 编辑按钮 → ProviderDrawer（回填现有值，apiKey 显示占位符）
   - 保存 → PUT /api/providers/:id
   - 测试连接 → POST /api/test-connection

3. Model 操作:
   - 添加按钮 → ModelDrawer（空表单）
   - 编辑按钮 → ModelDrawer（回填 model 值）
   - 删除按钮 → ConfirmDialog → DELETE
   - 导入按钮 → ImportDrawer（文本区 + 预览 + 确认）

4. 面包屑导航: 仪表盘 > 提供者 > deepseek
```

### 5 态设计

| 状态 | 表现 |
|------|------|
| **正常** | Provider 信息卡片 + Model DataTable |
| **空 Model** | Provider 信息正常，Model 列表显示 "该 Provider 下暂无模型，点击添加" |
| **加载** | Provider 卡片 Skeleton + Model 列表 Skeleton |
| **错误** | "获取 Provider 信息失败" / "获取 Model 列表失败" + 重试 |
| **404** | Provider ID 不存在 → "Provider 不存在" + 返回列表按钮 |

---

## Page 5: Model 添加/编辑 (Drawer)

### 抽屉布局

```
┌───────────────────────── Model 添加 ────── [ × ] ┐
│                                                  │
│  Model ID *        [deepseek-v4-flash    ]       │
│  Model Name        [DeepSeek V4 Flash    ]       │
│  API Type          [继承 Provider ▼      ]       │
│  Reasoning         [● 开 / ○ 关         ]       │
│  Input Types       [text] [image] [audio]        │
│  Context Window    [1000000            ]         │
│  Max Tokens        [384000             ]         │
│                                                  │
│  ▼ 成本配置 (高级)                               │
│  ┌──────────────────────────────────────────────┐│
│  │ Input ($/M):    [0.14 ]                      ││
│  │ Output ($/M):   [0.28 ]                      ││
│  │ Cache Read:     [0.028]                      ││
│  │ Cache Write:    [0    ]                      ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│              [ 取消 ]    [ 保存 ]                │
└──────────────────────────────────────────────────┘

组件: ModelDrawer > ModelForm + CostForm + FormInput × N + FormSwitch + FormTags + FormSelect + FormNumber
```

### 交互流程

```
1. 点击"添加"或"编辑"按钮 → 打开 ModelDrawer
2. 添加模式: 所有字段空/默认值
3. 编辑模式: 回填现有值（从 model 数据）
4. 点击"保存":
   - 添加: POST /api/providers/:id/models
   - 编辑: PUT /api/providers/:id/models/:mid
5. 成功 → 关闭抽屉 + 刷新 Model 列表 + Notification 成功
6. 失败 → Notification 错误
```

### 校验规则

```
- Model ID: 必填，只允许字母数字连字符，2-64字符
- Model Name: 选填，留空自动取 ID
- Context Window: 数字，>0，≤ 100000000
- Max Tokens: 数字，>0，≤ Context Window
- Cost 价格: ≥0 的数字
```

---

## Page 6: Provider 添加/编辑 (Drawer)

### 抽屉布局

```
┌─────────────────────── Provider 编辑 ─── [ × ] ┐
│                                                │
│  Provider ID *    [deepseek              ]     │
│  Base URL *       [https://api.deepseek.com]   │
│  API Type *       [openai-completions    ▼]    │
│  API Key          [●●●●●●●●●●           ] 👁️  │
│  Auth Mode        [api-key              ▼]    │
│  Region           [                     ]     │
│  Timeout (sec)    [                     ]     │
│                                                  │
│  [ 测试连接 ]                                    │
│  [保存] [取消]                                   │
│                                                  │
└──────────────────────────────────────────────────┘

组件: ProviderDrawer > ProviderForm + FormInput × N + FormSelect + FormNumber + TestConnection
```

### API Key 交互

```
- API Key 字段旁有 👁️ 切换可见性按钮
- 默认遮罩显示
- 编辑 Provider 时: API Key 显示占位符 "●●●●●●●●●●"（后端不返回实际值）
- 如果用户输入了新 Key → 覆盖旧值
- 如果用户未改动 Key 字段 → 保持旧值不变
```

---

## Page 7: 批量导入 Model (Drawer)

### 抽屉布局

```
┌──────────────────── 导入 Model ──────── [ × ] ┐
│                                                │
│  粘贴 JSON 格式的模型列表:                      │
│  ┌────────────────────────────────────────────┐│
│  │ [                                            ││
│  │   {                                        ││
│  │     "id": "gpt-4o",                       ││
│  │     "name": "GPT-4o",                      ││
│  │     "contextWindow": 128000,               ││
│  │     "maxTokens": 16384                     ││
│  │   },                                       ││
│  │   ...                                      ││
│  │ ]                                            ││
│  └────────────────────────────────────────────┘│
│                                                │
│  ┌─ 预览 ─────────────────────────────────────┐│
│  │ Model ID    │ Name    │ Ctx     │ Max      ││
│  │ gpt-4o      │ GPT-4o  │ 128000  │ 16384    ││
│  │ gpt-4o-mini │ GPT-4oM │ 128000  │ 16384    ││
│  │ 共 2 个模型                                 ││
│  └────────────────────────────────────────────┘│
│                                                │
│          [ 取消 ]    [ 导入 2 个模型 ]          │
└────────────────────────────────────────────────┘

组件: ImportDrawer > TextArea + PreviewTable + Button
```

---

## 全局 5 态规范

| 状态 | 实现方式 |
|------|----------|
| **Loading** | Naive UI Skeleton（卡片+表格），避免闪烁 |
| **Empty** | 自定义插画 + 引导文字 + CTA 按钮 |
| **Error** | Naive UI Notification 错误提示 + 内联错误状态（可重试） |
| **401** | 路由守卫拦截 → 跳转 /login + Notification "登录已过期，请重新登录" |
| **404** | 页面 Not Found → "页面不存在" + 返回首页按钮 |
| **网络故障** | 请求超时/断网 → "网络连接失败，请检查服务器状态" |
