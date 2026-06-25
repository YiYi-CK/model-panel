# 🦊 OpenClaw 模型管理面板

一个轻量的 Web 管理面板，通过浏览器可视化管理 [OpenClaw](https://docs.openclaw.ai) 的大模型配置（Provider/Model/API Key），免去手动编辑 `openclaw.json` 的麻烦。

## 功能

- 🔐 **Linux PAM 登录** — 用系统账号密码登录，安全可靠
- 🏢 **Provider 管理** — 添加/编辑/删除 LLM Provider（DeepSeek/OpenAI/Claude/Gemini/Ollama 等）
- 🤖 **Model 管理** — 管理每个 Provider 下的模型配置（上下文窗口/Token/成本等）
- 🎯 **默认模型设置** — 一键切换 OpenClaw 默认模型
- 🔑 **API Key 管理** — 安全化管理 API Key（自动脱敏展示）
- ⚡ **即改即生效** — 通过 `openclaw config patch` 写入，自动热重载
- 🌐 **中英双语** — 支持中文/English 切换

## 技术栈

| 层 | 技术 |
|------|------|
| 后端 | Node.js + Express |
| 前端 | Vue 3 + Naive UI + Vite |
| 认证 | Linux PAM (Python ctypes helper) |
| 配置 | OpenClaw CLI (`config get/patch`) |

## 快速开始

```bash
# 克隆
git clone https://github.com/YiYi-CK/model-panel.git
cd model-panel

# 安装依赖
npm install

# 开发模式（Vite :5173 → Express :3020）
npm run dev

# 生产构建
npm run build && npm start
```

打开 `http://localhost:3020/`，用 Linux 系统账号登录。

## 项目结构

```
model-panel/
├── server/           ← Express 后端
│   ├── index.js      ← 入口 + 路由
│   ├── auth.js       ← PAM 认证
│   ├── config.js     ← OpenClaw 配置读取
│   ├── patcher.js    ← 配置写入 (CLI patch)
│   ├── provider.js   ← Provider CRUD
│   ├── model.js      ← Model CRUD
│   ├── util.js       ← 工具函数
│   └── pam_helper.py ← Python PAM ctypes helper
├── src/              ← Vue 3 前端
│   ├── views/        ← 页面组件
│   ├── components/   ← 原子/分子/有机体组件
│   ├── layouts/      ← 布局模板
│   └── locales/      ← 国际化文件
├── .spec/            ← 开发文档（宪章/PRD/架构/设计）
└── vite.config.js
```

## 环境要求

- Node.js >= 18
- Linux (需要 PAM 支持)
- OpenClaw 已安装

## License

MIT
