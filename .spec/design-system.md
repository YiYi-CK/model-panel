# Phase 4: 设计系统 — OpenClaw 模型管理面板

> **项目类型:** SaaS/Web App → Phase 4 深度 ⭐⭐
> **UI 库:** Naive UI 2.x（在此之上定制主题）

---

## 1️⃣ 设计风格

**定位：** 专业管理后台，干净克制，不花哨。

| 维度 | 方向 |
|------|------|
| **风格** | Minimal — 信息密度中等，留白充足 |
| **气质** | 专业、可信赖，和 OpenClaw ClawPanel 风格呼应 |
| **配色** | 主色深蓝/靛青，不喧宾夺主 |
| **圆角** | 温和（8px），不过分圆润 |
| **阴影** | 轻微，只在抽屉/弹窗时用 |
| **动画** | 克制，微动效增强反馈感（150-250ms） |

---

## 2️⃣ 色彩系统

### 主色

```
Primary:     #2080F0  (Naive UI 默认蓝)
PrimaryHover:#4098FC
PrimaryPress:#1870D8

Success:     #18A058  (绿色 — 成功通知)
Warning:     #F0A020  (黄色 — 删除确认)
Error:       #D03050  (红色 — 错误/删除按钮)
Info:        #2080F0  (蓝色 — 信息提示)
```

### 中性色

```
Text Primary:    #1F2225
Text Secondary:  #50555A
Text Disabled:   #C2C2C2
Border:          #E0E0E6
Divider:         #F0F0F6
Background:      #F7F8FA
Card:            #FFFFFF
Hover:           #F2F3F5
```

### 语义色场景

| 颜色 | 使用场景 |
|------|----------|
| **Primary** | 主按钮、链接、选中态、开关激活 |
| **Success** | 成功通知、连接成功标签、在线状态 |
| **Warning** | 删除确认按钮、警告通知 |
| **Error** | 错误通知、删除操作、离线状态 |
| **Info** | 信息卡片、配置值展示 |

---

## 3️⃣ 字体系统

```
家族: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif

Heading (标题):
  <h1>  24px / 700 / line-height: 1.3
  <h2>  20px / 600 / line-height: 1.3
  <h3>  16px / 600 / line-height: 1.4

Body (正文):
  14px / 400 / line-height: 1.6  ← 默认
  13px / 400 / line-height: 1.5  ← 辅助文字

Code (技术参数):
  'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace
  13px / 400 / line-height: 1.5
  用于: Model ID, baseUrl, config Hash
```

**中文优先显示 → PingFang SC(果) → Microsoft YaHei(微) → 系统默认**

---

## 4️⃣ 间距系统

```
基准单位: 4px

    4px  → xs (紧凑间距)
    8px  → sm (组件内部内边距)
   12px  → md (表单行间距)
   16px  → lg (卡片内边距、段间距)
   24px  → xl (页面内边距、模块间距)
   32px  → 2xl (大模块间距)
   48px  → 3xl (页面顶部间距)

Card Padding:    16px (lg)
Page Padding:    24px (xl)
Form Row Gap:    16px (lg)
Section Gap:     24px (xl)
Drawer Width:    480px
Drawer Padding:  24px
```

---

## 5️⃣ 圆角

```
Button:          6px
Input/Select:    6px
Card:            8px
Dialog/Modal:    10px
Drawer:          0px (贴边，不圆角)
Tag/Badge:       4px
Code Block:      6px
Skeleton:        6px
```

---

## 6️⃣ 阴影

```
Card (悬浮):    0 2px 8px rgba(0,0,0,0.08)
Dialog:         0 4px 16px rgba(0,0,0,0.12)
Drawer:         0 -4px 16px rgba(0,0,0,0.10)
Notification:   0 4px 12px rgba(0,0,0,0.15)
Dropdown Menu:  0 4px 12px rgba(0,0,0,0.10)
```

---

## 7️⃣ 断点（响应式）

```
Desktop:   ≥ 1024px  → 侧边栏展开 + 全宽表格
Tablet:    768-1023px → 侧边栏折叠 + 卡片换行
Mobile:    < 768px    → 单列布局 + 侧边栏隐藏（汉堡菜单）

本工具以 Desktop 为主，但兼容 Tablet 和 Desktop 级别。
```

---

## 8️⃣ Z-Index 层级

```
0        → 内容区
10       → 侧边栏
100      → NavBar (固定顶部)
200      → 下拉菜单 (Dropdown)
300      → 抽屉遮罩 (Drawer overlay)
400      → 抽屉 (Drawer)
500      → 弹窗遮罩 (Dialog overlay)
600      → 弹窗 (Dialog/Modal)
1000     → 通知 (Notification)
1100     → Loading 全屏遮罩
```

---

## 9️⃣ 过渡与动画

```
微交互:
  按钮 hover:     background-color 150ms ease
  按钮 press:     transform scale(0.97) 100ms ease
  输入框 focus:   border-color 150ms ease, box-shadow 150ms ease
  链接 hover:     color 150ms ease

组件动画:
  抽屉打开:       transform translateX(100% → 0) 250ms cubic-bezier(0.4,0,0.2,1)
  抽屉关闭:       transform translateX(0 → 100%) 200ms cubic-bezier(0.4,0,0.2,1)
  弹窗打开:       opacity 0→1 + scale 0.95→1 200ms cubic-bezier(0.4,0,0.2,1)
  通知滑入:       transform translateY(-20px → 0) + opacity 200ms ease
  Skeleton:       pulse animation 1.5s ease-in-out infinite

页面切换:
  不添加路由过渡动画（管理工具，追求即时响应）
```

---

## 🔟 图标

```
Naive UI 内置图标（全部使用内建，不加额外图标库）:

导航:     DashboardOutlined, ServerOutlined
操作:     PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined
状态:     CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined
功能:     SearchOutlined, CopyOutlined, EyeOutlined, EyeOffOutlined,
          ArrowBackOutlined, LogoutOutlined, UserOutlined, RefreshOutlined
导入:     ImportOutlined, CodeOutlined
安全:     LockOutlined, KeyOutlined
```

---

## 1️⃣1️⃣ 状态令牌 (State Tokens)

```
=== 错误态 ===
  Input Error Border:  #D03050
  Input Error Bg:      #FFF0F1
  Error Text:          #D03050

=== 成功态 ===
  Success Text:        #18A058
  Success Bg:          #F0F9F3

=== 加载态 ===
  Spinner Color:       Primary #2080F0
  Skeleton Color:      #F2F3F5 → #E8E9EB (pulse)

=== 禁用态 ===
  Disabled Text:       #C2C2C2
  Disabled Bg:         #F2F3F5
  Disabled Border:     #E0E0E6

=== 悬停态 ===
  Table Row Hover:     #F7F8FA
  Card Hover:          shadow +2px
  Button Hover:        10% white overlay
```

---

## 1️⃣2️⃣ 可访问性 (Accessibility)

| 标准 | 实现 |
|------|------|
| **颜色对比度** | Primary 文字 ≥ 4.5:1 (WCAG AA) |
| **焦点指示** | 所有可交互元素有 visible focus ring（Naive UI 默认） |
| **表单标签** | 所有 input 有关联 label |
| **键盘导航** | Tab 有序，Enter 提交，Escape 关闭弹窗 |
| **错误反馈** | 表单错误字段有红色边框 + 错误文字（不光靠颜色） |

---

## 1️⃣3️⃣ 与 Naive UI 的关系

```
本项目在 Naive UI 默认主题基础上定制:

n-theme-provider 配置:
  themeOverrides = {
    common: {
      primaryColor: '#2080F0',
      primaryColorHover: '#4098FC',
      primaryColorPressed: '#1870D8',
      borderRadius: '6px',
    },
    Card: {
      borderRadius: '8px',
    }
  }
```

> 不做独立的完整主题，只在 Naive UI 基础上微调。保持一致性。
