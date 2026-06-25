# Phase 5-1: Atoms 原子组件 Spec

> 13 个原子组件 — 最小不可分 UI 单元

---

## A1. AppLogo

```yaml
文件: src/components/atoms/AppLogo.vue
描述: 应用 Logo 展示
Props: 无
Template: 🦊 OpenClaw 模型管理 (一行文字 + emoji)
Size: h1 级别，居中
```

---

## A2. FormInput

```yaml
文件: src/components/atoms/FormInput.vue
描述: 通用文本输入，封装 Naive UI n-input
Props:
  - modelValue: string          # v-model 绑定
  - label: string               # 标签
  - placeholder: string
  - type: string (default "text")  # text | password
  - disabled: boolean
  - errorText: string           # 校验错误文字
  - maxlength: number
Emits:
  - update:modelValue
States:
  - 正常
  - Error: 红色边框 + errorText
  - Disabled: 灰色背景
```

---

## A3. FormSelect

```yaml
文件: src/components/atoms/FormSelect.vue
描述: 通用下拉选择，封装 Naive UI n-select
Props:
  - modelValue: string | number
  - label: string
  - options: Array<{ label, value }>
  - placeholder: string
  - disabled: boolean
Emits:
  - update:modelValue
```

---

## A4. FormSwitch

```yaml
文件: src/components/atoms/FormSwitch.vue
描述: 开关组件，封装 Naive UI n-switch
Props:
  - modelValue: boolean
  - label: string
Emits:
  - update:modelValue
```

---

## A5. FormNumber

```yaml
文件: src/components/atoms/FormNumber.vue
描述: 数字输入，封装 Naive UI n-input-number
Props:
  - modelValue: number
  - label: string
  - placeholder: string
  - min: number (default 0)
  - max: number
  - disabled: boolean
Emits:
  - update:modelValue
```

---

## A6. FormTags

```yaml
文件: src/components/atoms/FormTags.vue
描述: 多选标签（如 Input Types: text/image/audio）
Props:
  - modelValue: string[]        # 已选值数组
  - label: string
  - options: Array<{ label, value }>
Emits:
  - update:modelValue
实现: 用 Naive UI n-tag + n-checkbox-group 或 n-select multiple
```

---

## A7. ApiKeyDisplay

```yaml
文件: src/components/atoms/ApiKeyDisplay.vue
描述: API Key 脱敏展示组件
Props:
  - maskedKey: string           # 脱敏后的字符串，如 "sk-...xxxx"
  - showCopy: boolean (default true)
功能:
  - 显示 `sk-...xxxx` 格式
  - 复制按钮（点击复制实际值到剪贴板，需通过 prop 拿到完整值）
  - 如果没有 key → 显示 "未设置"
States:
  - 有关键字: 显示脱敏格式 + 复制按钮
  - 无关键字: 灰色 "未设置" 文字
```

---

## A8. StatusBadge

```yaml
文件: src/components/atoms/StatusBadge.vue
描述: 状态标签
Props:
  - status: 'running' | 'error' | 'unknown' | 'offline'
  - text: string                # 自定义文字（可选）
映射:
  running → 绿色圆点 + "运行中"
  error   → 红色圆点 + "异常"
  unknown → 灰色圆点 + "未知"
  offline → 灰色圆点 + "离线"
```

---

## A9. EmptyState

```yaml
文件: src/components/atoms/EmptyState.vue
描述: 空状态占位
Props:
  - title: string               # 如 "暂无 Provider"
  - description: string         # 如 "点击添加按钮创建第一个 Provider"
  - showAction: boolean         # 是否显示 CTA 按钮
Slots:
  - default                     # CTA 按钮内容（如 [添加 Provider]）
```

---

## A10. LoadingSpinner

```yaml
文件: src/components/atoms/LoadingSpinner.vue
描述: 全屏/局部加载动画
Props:
  - text: string (default "加载中...")
  - inline: boolean             # inline=false 全屏居中，true 内联
实现: Naive UI n-spin
```

---

## A11. ConfirmDialog

```yaml
文件: src/components/atoms/ConfirmDialog.vue
描述: 确认弹窗（通用）
Props:
  - show: boolean
  - title: string (default "确认操作")
  - content: string             # 确认提示文字
  - confirmText: string (default "确定")
  - cancelText: string (default "取消")
  - type: 'warning' | 'error' | 'info'  # 确认按钮颜色
Emits:
  - confirm
  - cancel
  - update:show
实现: Naive UI n-modal
```

---

## A12. BackButton

```yaml
文件: src/components/atoms/BackButton.vue
描述: 返回上一页按钮
Props:
  - to: string                  # 目标路由路径
  - text: string                # 按钮文字（点击 Propvider 名等）
```

---

## A13. CopyButton

```yaml
文件: src/components/atoms/CopyButton.vue
描述: 点击复制到剪贴板
Props:
  - text: string                # 要复制的文本
  - label: string               # 可选按钮文字
功能: 点击后 Naive UI Toast "已复制"，自动 2s 消失
```
