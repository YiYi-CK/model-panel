# Phase 5-4: Templates 模板组件 Spec

> 3 个模板组件 — 页面布局骨架

---

## T1. GuestLayout

```yaml
文件: src/layouts/GuestLayout.vue
描述: 登录页布局 — 居中卡片，无导航
布局:
  - 全屏 flex 居中
  - 背景: #F7F8FA
  - 内容: 白色 Card (max-width: 400px, border-radius: 10px)
  - Footer: 灰色小字 "yiyi-vm (Ubuntu 26.04)"
Slots:
  - default                     # 表单内容
```

---

## T2. MainLayout

```yaml
文件: src/layouts/MainLayout.vue
描述: 主布局 — 顶栏 + 侧边栏 + 内容区
组成:
  - NavBar (固定在顶部, height: 52px)
  - 侧边菜单 (宽 180px):
    - 📊 仪表盘 → /dashboard
    - 🏢 提供者 → /providers
    - 当前路由高亮
  - 内容区 (padding: 24px, 剩余宽度)
响应式:
  - ≥ 1024px: 侧边栏展开
  - < 1024px: 侧边栏隐藏，NavBar 显示汉堡菜单
Slots:
  - default                     # 页面内容
状态:
  - 未登录: 不适用（SessionGuard 保证已登录）
  - 已登录: 正常展示
```

---

## T3. ConfigLayout

```yaml
文件: src/layouts/ConfigLayout.vue
描述: 配置管理布局 — 面包屑 + 内容区
组成:
  - 面包屑导航（Naive UI n-breadcrumb）
  - 页面标题
  - 内容区
Props:
  - breadcrumbs: Array<{ label, to? }>
  - title: string
Slots:
  - default                     # 页面内容
使用场景:
  - Provider 详情页（需要面包屑: 仪表盘 > 提供者 > deepseek）
  - Provider 列表页（可简化为只有标题）
```
