# Phase 1: PRD — 产品需求文档（修正版 v2）

> 基于 Pro 模式深度审查后的修正版本
> 审查时间: 2026-06-25

---

## 1️⃣ 产品定位

**一句话：** 一个轻量的 Web 管理面板，通过浏览器管理 OpenClaw 的大模型配置，免去手动编辑 `openclaw.json` 的麻烦。

**核心价值：** 
- 不用 ssh + vim 改配置文件
- 可视化添加/删除 LLM Provider
- 可视化添加/删除/编辑 Model
- 管理 API Key 和安全配置
- 即改即生效（OpenClaw 支持热重载）

---

## 2️⃣ 目标用户

| 维度 | 说明 |
|------|------|
| 用户 | Leo（系统管理员） |
| 场景 | 本机或内网浏览器操作 |
| 权限 | 需具备 Linux 系统账号密码 |

---

## 3️⃣ 竞品/参考

| 参考 | 说明 |
|------|------|
| OpenClaw config CLI | `openclaw config patch` — 命令行方式，现有但不够直观 |
| OpenClaw ClawPanel | 内建 Web UI，但不提供 model 管理页面 |
| LiteLLM Proxy UI | 类似概念，但过度复杂 |

**定位：** 填补 ClawPanel 缺少的模型管理功能缺口。

---

## 4️⃣ 核心功能 MVP

### 4.1 登录模块

```
[Linux PAM Login]
├─ 输入: 用户名 + 密码
├─ 后端: authenticate-pam 验证系统账号
├─ 成功: 生成 session（1h），写入 HttpOnly Cookie
├─ 失败: 显示"用户名或密码错误"（不暴露具体原因）
├─ 记住我: 勾选后 session 延长至 24h
└─ 已登录: 所有 API 请求经 session 中间件校验，未登录返回 401
```

### 4.2 配置概览面板

```
[Dashboard]
├─ 当前 models.mode: merge / replace（展示当前值）
├─ 已配置 Provider 数量及每个的 model 数量
├─ 当前配置文件 hash（和 openclaw config.get 一致）
├─ OpenClaw Gateway 运行状态
├─ 默认模型: deepseek/deepseek-v4-flash
└─ 配置最后修改时间
```

### 4.3 Provider 管理

```
[Provider 列表]
├─ 展示所有已配置的 provider（顶级对象键名）
│  ├─ Provider ID（如 deepseek, openai, anthropic）
│  ├─ baseUrl
│  ├─ API Type（openai-completions / anthropic-messages / google-gemini 等）
│  ├─ 模型数量统计
│  ├─ 操作按钮（编辑 / 删除）
│  └─ 连接测试按钮（ping baseUrl 验证可达性）
│
├─ 添加 Provider 表单（展开式/弹窗）
│  ├─ Provider ID（必填，唯一标识，如 my-custom-provider）
│  ├─ baseUrl（必填，如 https://api.myprovider.com/v1）
│  ├─ API Type（必选，下拉: openai-completions / anthropic-messages / google-gemini / ollama）
│  ├─ API Key（输入完整值，保存后脱敏展示为 sk-...xxxx）
│  ├─ Auth Mode（可选: api-key / token / oauth / aws-sdk，默认 api-key）
│  ├─ Region（可选，如 us-east-1）
│  ├─ Timeout Seconds（可选，默认空=不限制）
│  ├─ Context Window（可选，provider 级默认值）
│  ├─ Max Tokens（可选，provider 级默认值）
│  ├─ Headers（可选，高级，键值对形式）
│  ├─ 测试连接按钮（保存前可先 ping）
│  └─ 保存 → 调用 openclaw config patch --stdin 热写入
│
└─ 编辑/删除 Provider
   ├─ 编辑：回填现有值（API Key 仅显示占位符，需重新输入才修改）
   └─ 删除：确认弹窗 → 删除 provider 及其下所有模型
```

### 4.4 Model 管理

```
[Model 列表]（每个 Provider 独立子页面）
├─ 展示该 provider 下所有 model 对象
│  ├─ Model ID（如 deepseek-v4-flash）
│  ├─ Model Name（显示名称，如 DeepSeek V4 Flash）
│  ├─ API Type（继承 provider 或独立指定）
│  ├─ Context Window（上下文窗口，数字）
│  ├─ Max Tokens（最大输出，数字）
│  ├─ Reasoning（是否支持推理: true/false）
│  ├─ Input Types（输入类型: text / image / audio 的数组）
│  ├─ Cost 信息（折叠展示）
│  │  ├─ Input（$/M tokens）
│  │  ├─ Output（$/M tokens）
│  │  ├─ Cache Read（$/M tokens）
│  │  └─ Cache Write（$/M tokens）
│  └─ 操作按钮（编辑 / 删除）
│
├─ Model 表单字段（添加/编辑共用）
│  ├─ Model ID（必填，如 gpt-4o-mini）
│  ├─ Model Name（选填，留空自动取 ID）
│  ├─ API Type（可选，不填继承 provider.api）
│  ├─ Reasoning（开关: 是否支持推理）
│  ├─ Input Types（多选: text / image / audio）
│  ├─ Context Window（数字，默认 128000）
│  ├─ Max Tokens（数字，默认 4096）
│  ├─ Cost（折叠高级设置）
│  │  ├─ Input Price（$/M tokens）
│  │  ├─ Output Price（$/M tokens）
│  │  ├─ Cache Read Price（$/M tokens）
│  │  └─ Cache Write Price（$/M tokens）
│  └─ 保存
│
├─ 批量导入模型
│  └─ 文本框粘贴 JSON 数组格式的 model 列表，预览后确认导入
│
└─ 删除 Model
   └─ 确认弹窗
```

### 4.5 配置操作核心流程

```
[配置操作流程]
1. 用户填写表单 → 点击保存
2. 后端: 构建 JSON patch 结构
3. 后端: 执行 openclaw config patch --stdin（自带 schema 校验）
   ├─ 成功 → 返回 200 + 通知
   ├─ 校验失败 → 返回校验错误详情
   └─ 异常 → 返回错误信息（不暴露敏感细节）
4. 前端: 显示成功/失败通知
```

**重要：不用直接读写 openclaw.json！** 全部走 `openclaw config patch --stdin`，优点：
- ✅ 自动 schema 校验
- ✅ 自带头热重载
- ✅ 格式校验失败自动拒绝
- ✅ 支持 dry-run 预览

### 4.6 连接测试功能

```
[测试连接]
├─ 提供 baseUrl（可只测 URL 可达性）
├─ 后端: 发 HEAD/GET 请求到 baseUrl（超时 5s）
├─ 结果: 可达 / 不可达（显示 http 状态码或连接错误）
└─ 纯连通性测试，不涉及认证
```

---

## 5️⃣ 非功能需求

| 需求 | 说明 |
|------|------|
| **安全性** | API Key 列表展示时脱敏（`sk-...xxxx`），编辑时需重新输入完整值才修改 |
| **Session 安全** | Cookie 设为 HttpOnly + SameSite=Lax，JS 无法读取 |
| **认证中间件** | 所有 /api/* 路径必须经过 session 校验，未登录一律 401 |
| **可用性** | 所有操作有 loading 状态，失败有明确错误提示 |
| **容错** | 配置修改通过 `openclaw config patch` 自带校验，无需额外备份 |
| **校验** | 后端对 Provider ID / Model ID 做合法性校验（只允许字母数字连字符） |

---

## 6️⃣ 技术栈

| 层级 | 技术 | 版本 | 理由 |
|------|------|------|------|
| **后端运行时** | Node.js | >=18 | 与 OpenClaw 一致 |
| **后端框架** | Express | 4.x | 轻量稳定，复用餐算子经验 |
| **PAM 认证** | authenticate-pam | latest | 直接调 Linux PAM |
| **Session** | express-session | latest | 服务端 session |
| **Session 存储** | **内存 session**（推荐） | — | 单用户工具，重启即失效更安全 |
| **前端框架** | Vue 3 | 3.x | 沿用餐算子 |
| **UI 组件库** | Naive UI | 2.x | 同上 |
| **构建工具** | Vite | 5.x | 同上 |
| **HTTP 客户端** | axios | latest | 前后端通信 |
| **配置操作** | **openclaw config patch --stdin** | — | 官方 API，自带校验+热重载 |
| **进程管理** | PM2 | latest | 进程守护 + 自动重启 |

---

## 7️⃣ API 设计

### REST API

```
GET    /api/status                    ─ 检查登录状态
POST   /api/auth/login                ─ PAM 登录
POST   /api/auth/logout               ─ 登出

GET    /api/providers                  ─ 获取所有 provider
GET    /api/providers/:providerId      ─ 获取单个 provider 详情（API Key 脱敏）
PUT    /api/providers/:providerId      ─ 编辑 provider
DELETE /api/providers/:providerId      ─ 删除 provider
POST   /api/providers                  ─ 添加 provider

GET    /api/providers/:providerId/models       ─ 获取 provider 下所有 model
GET    /api/providers/:providerId/models/:modelId  ─ 获取单个 model
PUT    /api/providers/:providerId/models/:modelId  ─ 编辑 model
DELETE /api/providers/:providerId/models/:modelId  ─ 删除 model
POST   /api/providers/:providerId/models       ─ 添加 model
POST   /api/providers/:providerId/models/import ─ 批量导入 model

POST   /api/test-connection           ─ 测试 URL 连通性
```

### 认证接口细节

```
POST /api/auth/login
Body: { username: "leo", password: "***" }
Success 200: { ok: true, user: "leo", sessionExpires: 3600000 }
Error 401:  { ok: false, error: "用户名或密码错误" }

GET /api/status
Cookie: connect.sid=***
Success 200: { authenticated: true, user: "leo", expiresAt: 1700000000000 }
Error 401:  { authenticated: false }
```

---

## 8️⃣ 项目路线图

```
Phase 1 (MVP) — 基础能力
  □ PAM 登录 + Session 校验
  □ Dashboard 配置概览
  □ Provider 列表 / 添加 / 编辑 / 删除
  □ Model 列表 / 添加 / 编辑 / 删除
  □ 配置写入（openclaw config patch --stdin）
  □ API Key 脱敏展示
  □ URL 连接测试

Phase 2 (增强) — 高级管理
  □ 批量导入 Model（JSON 粘贴）
  □ 配置 diff 预览
  □ 配置回滚（历史版本管理）
  □ 配置导出/导入
  □ 全字段高级配置（headers, request overrides, localService 等）

Phase 3 (优化) — 体验
  □ 操作日志
  □ 暗色模式
  □ 国际化（英文支持）
```
