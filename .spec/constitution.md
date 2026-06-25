# Phase 0: 项目宪章 — OpenClaw 模型管理面板

> **项目名称:** OpenClaw Model Panel
> **项目类型:** SaaS / Web App（管理后台工具）
> **部署方式:** 独立 Web 服务，与 OpenClaw 同机运行
> **创建日期:** 2026-06-25

---

## 0️⃣-1 编码规范

| 规则 | 约定 |
|------|------|
| **后端语言** | Node.js (>=18) + Express |
| **前端框架** | Vue 3 + Naive UI（沿用餐算子技术栈） |
| **构建工具** | Vite |
| **包管理** | npm |
| **后端命名** | camelCase（变量/函数/文件） |
| **前端命名** | PascalCase（Vue 组件），camelCase（JS 变量/函数） |
| **代码风格** | ESLint + Prettier（参考餐算子配置） |
| **注释语言** | 中文（解释意图，不注释"显而易见"的代码） |
| **Git 提交** | 中文简述，前缀标注模块，如 `feat: 添加provider管理页面` |

## 0️⃣-2 测试标准

- 本项目为内网管理工具，**轻量测试**
- 关键路径手动测试覆盖：
  - PAM 登录成功/失败
  - 添加/删除 provider
  - 添加/删除/编辑 model
  - API Key 保存/脱敏展示
  - 配置文件热重载验证
- 不要求自动化测试框架（可后续补 Jest）

## 0️⃣-3 性能要求

| 指标 | 要求 |
|------|------|
| 登录响应 | P99 < 500ms（PAM 验证延迟主要取决于系统） |
| 列表加载 | < 200ms（数据量极小，本地文件读取） |
| 配置写入 | < 500ms（JSON 文件写入 + 热重载） |
| 内存占用 | < 50MB（轻量工具） |
| 首屏加载 | < 2s（Vite build + 本地服务） |

## 0️⃣-4 UI/UX 一致性

| 维度 | 规范 |
|------|------|
| **语言** | 界面中文为主，技术参数（model id 等）保留英文原文 |
| **响应式** | 桌面优先（管理工具），但兼容 1024px+ 屏幕 |
| **主题** | 浅色模式为主（和 OpenClaw 风格一致），不要求暗色模式 v1 |
| **状态覆盖** | 正常/空态（无provider时）/加载态/错误态（PAM认证失败/文件IO错误） |
| **反馈** | 操作成功/失败使用 Naive UI 的 Notification 组件 |
| **错误提示** | 敏感信息脱敏（如"PAM 认证失败"，不暴露具体原因） |

## 0️⃣-5 安全约束

| 约束 | 说明 |
|------|------|
| **密码存储** | ❌ 不存密码。全部交给 Linux PAM（`pam_unix.so`）验证 |
| **会话** | express-session，服务端存储，1 小时过期，支持"记住我"延至 24h |
| **API Key** | 写入 openclaw.json 后脱敏展示（如 `sk-...xxxx`），**不全量回显** |
| **HTTPS** | 内网 HTTP 可接受（本机/内网使用），如暴露需加反向代理 TLS |
| **CSRF** | 使用 SameSite Cookie + 必要校验 |
| **XSS** | Vue 3 天然防 XSS，Naive UI 组件安全 |

---

## 0️⃣-6 部署约束

- ❌ **不做 Docker 容器化**（直接 Node 进程运行）
- 端口 待定（建议 3020 或用户指定）
- 以 systemd 服务或 PM2 方式管理进程生命周期
- 配置写入路径：`/home/joker/.openclaw/openclaw.json`
- 建议用 `openclaw config.patch` API 写入，而不是直接修改 JSON 文件

---

## 项目目录结构（规划）

```
model-panel/
├── .spec/                  ← 开发流程产出
│   ├── constitution.md     ← 本文件
│   ├── prd.md
│   ├── architecture.md
│   ├── pages.md
│   ├── design-system.md
│   ├── components/
│   └── tasks.md
├── server/                 ← Express 后端
│   ├── index.js            ← 入口 + 路由
│   ├── auth.js             ← PAM 认证模块
│   ├── config.js           ← OpenClaw 配置读写模块
│   └── middleware.js       ← Session 校验中间件
├── src/                    ← Vue 3 前端
│   ├── App.vue
│   ├── main.js
│   ├── router/
│   ├── views/
│   ├── components/
│   └── api/                ← 和后端的接口调用
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 决策记录

| 序号 | 决策 | 结论 |
|------|------|------|
| D1 | 技术栈 | Vue 3 + Naive UI + Node/Express（沿用餐算子） |
| D2 | 部署方式 | 独立 Web 服务，本机运行 |
| D3 | 操作范围 | Provider + Model + API Key + SecretRef 完整管理 |
| D4 | Session 有效期 | 1 小时，记住我延至 24 小时 |
| D5 | OpenClaw 集成 | 独立运行，不嵌入 ClawPanel（无插件机制） |
