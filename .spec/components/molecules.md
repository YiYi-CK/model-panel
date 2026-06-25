# Phase 5-2: Molecules 分子组件 Spec

> 11 个分子组件 — 原子组合，具备业务语义

---

## M1. NavBar

```yaml
文件: src/components/molecules/NavBar.vue
描述: 顶部导航栏
组成: AppLogo + 当前用户名 + 登出按钮
Props:
  - username: string
布局: flex, 左侧 Logo, 右侧用户名 + 登出
功能:
  - 点击 Logo → /dashboard
  - 点击登出 → POST /api/auth/logout → /login
```

---

## M2. SessionGuard

```yaml
文件: src/components/molecules/SessionGuard.vue
描述: 路由守卫 — 检查 session 状态
类型: 非可视化组件，Router beforeEach 守卫
逻辑:
  - 每次路由跳转前: GET /api/status
  - 未认证 → 跳转 /login
  - 已认证 → 放行
  - /login 路由: 已认证则跳转 /dashboard
实现: 在 router/index.js 中实现，不一定是 .vue 文件
```

---

## M3. ProviderCard

```yaml
文件: src/components/molecules/ProviderCard.vue
描述: Provider 卡片（用于列表页的卡片视图，或详情页的摘要卡）
Props:
  - provider: { id, baseUrl, api, apiKey, modelCount, auth, region }
  - showActions: boolean        # 是否显示操作按钮
组件:
  - 标题: Provider ID
  - 信息行: baseUrl, API type, Auth mode
  - API Key 脱敏: ApiKeyDisplay
  - Model 数: 小标签 "4 个模型"
  - 操作区: 详情 / 测试 / 删除 按钮
Emits:
  - view(providerId)
  - test(providerId)
  - delete(providerId)
```

---

## M4. ModelRow

```yaml
文件: src/components/molecules/ModelRow.vue
描述: 单个 Model 行（Table Row 单位）
Props:
  - model: { id, name, api, contextWindow, maxTokens, cost, reasoning, input }
  - showActions: boolean
渲染:
  - 行内展开:
    - Model ID (code 字体)
    - Model Name（中文显示名）
    - Context Window (如 "977k")
    - Max Tokens (如 "384k")
    - Cost 摘要 (如 "$0.14 / $0.28")
    - Reasoning 标签 (🧠 推理)
    - Input Types 标签 (📝text 🖼️image)
    - 操作: 编辑 / 删除
Emits:
  - edit(modelId)
  - delete(modelId)
```

---

## M5. ModelForm

```yaml
文件: src/components/molecules/ModelForm.vue
描述: Model 添加/编辑表单
Props:
  - initialData: object | null   # 编辑时回填，添加时 null
  - providerApi: string         # 当前 Provider 的 api（继承用）
构成:
  - FormInput    → Model ID
  - FormInput    → Model Name
  - FormSelect   → API Type (默认"继承 Provider")
  - FormSwitch   → Reasoning
  - FormTags     → Input Types
  - FormNumber   → Context Window
  - FormNumber   → Max Tokens
  - CostForm     → 成本配置（折叠面板）
Emits:
  - submit(data)                # { id, name, api, reasoning, input, contextWindow, maxTokens, cost }
  - cancel
校验:
  - Model ID: 必填 /^[a-zA-Z0-9_.-]{2,64}$/
  - Context Window: >0, ≤100000000
  - Max Tokens: >0, ≤ Context Window
  - Cost 各项: ≥0
```

---

## M6. ProviderForm

```yaml
文件: src/components/molecules/ProviderForm.vue
描述: Provider 添加/编辑表单
Props:
  - initialData: object | null
构成:
  - FormInput    → Provider ID (编辑时 disabled)
  - FormInput    → Base URL
  - FormSelect   → API Type
  - FormInput    → API Key (type=password，带 👁️ 切换)
  - FormSelect   → Auth Mode
  - FormInput    → Region
  - FormNumber   → Timeout (秒)
Emits:
  - submit(data)
  - cancel
校验:
  - Provider ID: 必填 /^[a-zA-Z0-9_.-]{2,64}$/
  - Base URL: 必填，以 http:// 或 https:// 开头
  - API Key: 选填（添加时不强制，但提示）
```

---

## M7. CostForm

```yaml
文件: src/components/molecules/CostForm.vue
描述: 成本填写面板
Props:
  - modelValue: { input, output, cacheRead?, cacheWrite? }
显示:
  - Naive UI n-collapse 折叠面板
  - 标题: "成本配置 (可选)"
  - 4 个 FormNumber:
    - Input ($/M tokens)
    - Output ($/M tokens)
    - Cache Read ($/M tokens)
    - Cache Write ($/M tokens)
  - 每个字段 unit="$/M"
Emits:
  - update:modelValue
```

---

## M8. TestConnection

```yaml
文件: src/components/molecules/TestConnection.vue
描述: 连接测试按钮 + 结果展示
Props:
  - baseUrl: string
状态:
  - idle: "测试连接" 按钮
  - testing: spinner + "测试中..."
  - success: ✅ "连接成功" (绿色)
  - error: ❌ "连接失败: {原因}" (红色)
实现:
  - 点击 → POST /api/test-connection { baseUrl }
  - 后端发 HEAD 到 baseUrl，超时 5s
  - 显示 http 状态码或错误
```

---

## M9. SkeletonCard / SkeletonTable

```yaml
描述: 骨架屏组件 — 复用 Naive UI n-skeleton
Card Skeleton: 高 120px, 宽自适应
Table Skeleton: 3 行 × 4 列 占位
命名: 直接使用 Naive UI <n-skeleton> 即可，不单独封装
```

---

## M10. CodeBlock

```yaml
文件: src/components/molecules/CodeBlock.vue
描述: 等宽文本展示块（用于配置 Hash、JSON 展示等）
Props:
  - text: string
  - label: string
样式:
  - 背景 #F7F8FA
  - 圆角 6px
  - padding 8px 12px
  - 字体 monospace 13px
```

---

## M11. KeyValueRow

```yaml
文件: src/components/molecules/KeyValueRow.vue
描述: 键值对展示行（用于详情卡片）
Props:
  - label: string               # 字段名
  - value: string | number      # 值
  - monospace: boolean          # 是否用等宽字体
  - copyable: boolean           # 是否可复制
布局: flex, label 占 120px 固定宽, value 占剩余
```
