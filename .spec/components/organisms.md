# Phase 5-3: Organisms 有机体组件 Spec

> 7 个有机体组件 — 分子组合，完整功能模块

---

## O1. LoginForm

```yaml
文件: src/views/Login.vue
描述: 登录表单页面
组成:
  - AppLogo (atoms)
  - FormInput (用户名)
  - FormInput (密码, type=password)
  - FormSwitch (记住我)
  - Button (登录)
状态:
  - 正常: 表单可交互
  - 加载: 按钮 spinner + 表单禁用
  - 错误: Notification 弹出错误提示
交互:
  - 点击登入 → axios POST /api/auth/login
  - 成功 → router.push('/dashboard')
  - 失败 → Notification { ok: false }
  - Enter 键 → 提交
路由: /login
布局: GuestLayout (居中卡片)
```

---

## O2. DashboardCards

```yaml
文件: src/views/Dashboard.vue
描述: 仪表盘概览页
组成:
  - 4 个统计卡片（Naive UI n-card）:
    - Provider 数量 + 图标
    - Model 总数
    - 配置模式 (merge/replace)
    - 默认模型
  - 配置信息区:
    - CodeBlock → 配置文件 Hash
    - KeyValueRow → 最后修改时间
    - 点击 Provider 数卡片 → /providers
状态:
  - 加载: Skeleton cards
  - 错误: 错误提示 + 重试
  - 空 Provider: 引导添加
路由: /dashboard
布局: MainLayout
数据源: GET /api/providers (统计) + GET /api/status (dashboard info)
```

---

## O3. ProviderList

```yaml
文件: src/views/Providers.vue
描述: Provider 列表页
组成:
  - 页面标题 "提供者管理"
  - 添加按钮 (右上角)
  - 搜索框 (本地过滤)
  - Naive UI n-data-table:
    - 列: Provider ID, Base URL, API Type, 模型数, 操作
    - 操作列: 详情 / 测试连接 / 删除
    - 排序: 按 Provider ID
  - ProviderDrawer (添加/编辑)
  - ConfirmDialog (删除确认)
状态:
  - 正常: DataTable 展示
  - 空: EmptyState "暂无 Provider"
  - 加载: Skeleton table
  - 错误: 错误 + 重试
  - 搜索无结果: "没有匹配的 Provider"
路由: /providers
布局: MainLayout
数据源: GET /api/providers
```

---

## O4. ProviderDetail

```yaml
文件: src/views/ProviderDetail.vue
描述: Provider 详情 + Model 管理页
组成:
  - 面包屑: 仪表盘 > 提供者 > {providerId}
  - Provider 信息卡片 (ProviderCard, showActions=false):
    - 展示 Provider ID, baseUrl, API type, Auth mode, API Key 脱敏
    - TestConnection 按钮
    - 编辑 Provider 按钮 → ProviderDrawer
  - Model 管理区:
    - 标题 "模型管理"
    - 添加 Model 按钮 + 导入按钮
    - Naive UI n-data-table (Model 列表)
    - ModelDrawer (添加/编辑)
    - ImportDrawer (批量导入)
    - ConfirmDialog (删除确认)
状态:
  - 正常: Provider 卡片 + Model 表格
  - 空 Model: EmptyState
  - 加载: Skeleton
  - 错误: 错误 + 重试
  - 404: Provider ID 不存在
路由: /providers/:id
布局: MainLayout
数据源: GET /api/providers/:id + GET /api/providers/:id/models
```

---

## O5. ModelDrawer

```yaml
文件: src/components/organisms/ModelDrawer.vue
描述: Model 添加/编辑侧边抽屉
Props:
  - show: boolean
  - mode: 'create' | 'edit'
  - initialData: object | null
  - providerId: string
  - providerApi: string
组成:
  - Naive UI n-drawer (width: 480px)
  - ModelForm (表单内容)
  - 底部按钮: 取消 / 保存
Emits:
  - close
  - saved          # 保存成功后通知父组件刷新
交互:
  - 打开 → 加载表单
  - 保存 → POST/PUT 到后端 → 刷新列表 → 关闭抽屉
  - 取消 → 关闭抽屉（不保存，无确认）
  - Escape → 关闭
```

---

## O6. ProviderDrawer

```yaml
文件: src/components/organisms/ProviderDrawer.vue
描述: Provider 添加/编辑侧边抽屉
Props:
  - show: boolean
  - mode: 'create' | 'edit'
  - initialData: object | null
组成:
  - Naive UI n-drawer (width: 520px)
  - ProviderForm
  - TestConnection 组件（底部可选）
  - 底部按钮: 取消 / 保存
Emits:
  - close
  - saved
交互: 同 ModelDrawer
```

---

## O7. ImportDrawer

```yaml
文件: src/components/organisms/ImportDrawer.vue
描述: 批量导入 Model 的 JSON 粘贴抽屉
Props:
  - show: boolean
  - providerId: string
组成:
  - Naive UI n-drawer (width: 560px)
  - TextArea (JSON 输入)
  - 预览表（解析成功后显示）:
    - n-data-table 显示将导入的 Model 列表
    - 显示总数
  - 错误信息（JSON 解析失败时）
  - 底部按钮: 取消 / 导入 N 个模型
Emits:
  - close
  - saved
校验:
  - JSON 解析合法性
  - 每个 model 至少需要 id 字段
  - 重复 Model ID 检测
```
