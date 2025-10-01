# 设计文档：自定义标题栏

## 概述
本设计文档详细说明了如何实现自定义窗口标题栏，该标题栏将替换原生 macOS 窗口装饰，同时保持现有的 UI 风格和设计系统一致性。

## 架构设计

### 系统架构
```
┌─────────────────────────────────────────┐
│         Tauri 窗口（无装饰）              │
├─────────────────────────────────────────┤
│  自定义标题栏组件                         │
│  ┌─────────────────────────────────┐   │
│  │ [●] [+] [⊞] [⚙] ... [>]        │   │
│  │  ↑   ↑   ↑   ↑       ↑          │   │
│  │  │   │   │   │       └─ 侧边栏   │   │
│  │  │   │   │   └─ 设置按钮         │   │
│  │  │   │   └─ 网格按钮             │   │
│  │  │   └─ 添加按钮                 │   │
│  │  └─ 关闭按钮                     │   │
│  │                                  │   │
│  │  [拖动区域 - data-tauri-drag]   │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│         待办事项列表区域                  │
│         (现有功能保持不变)                │
└─────────────────────────────────────────┘
```

### 组件层次结构
```
TodoWindow (修改)
├── CustomTitleBar (新建或内联)
│   ├── CloseButton (红色圆形按钮)
│   ├── Button (Plus - 现有组件)
│   ├── Button (Grid3x3 - 现有组件)
│   ├── Button (Settings - 现有组件)
│   └── Button (Chevron - 现有组件)
└── TodoList (现有，保持不变)
    └── ...
```

## 详细设计

### 1. Tauri 窗口配置

#### 文件：`src-tauri/tauri.conf.json`
**修改内容：**
```json
{
  "app": {
    "windows": [
      {
        "title": "Todo App",
        "width": 600,
        "height": 700,
        "minWidth": 400,
        "minHeight": 500,
        "resizable": true,
        "fullscreen": false,
        "decorations": false,  // 从 true 改为 false
        "transparent": false
      }
    ]
  }
}
```

**设计决策：**
- 禁用原生窗口装饰 (`decorations: false`)
- 保持所有其他窗口属性不变
- 不启用透明度，保持性能和兼容性

### 2. 权限配置

#### 文件：`src-tauri/capabilities/default.json`
**修改内容：**
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "store:default",
    "core:window:allow-close",           // 新增：允许关闭窗口
    "core:window:allow-start-dragging"   // 新增：允许拖动窗口
  ]
}
```

**设计决策：**
- 添加最小必需权限
- 不添加 minimize/maximize 权限（不需要）
- 遵循最小权限原则

### 3. 自定义标题栏组件设计

#### 组件结构
由于复杂度较低，将直接在 `TodoWindow` 组件中实现，不单独提取组件。

#### 视觉设计规范

**尺寸和间距：**
- 标题栏高度：`py-3`（12px 上下内边距）+ 内容高度
- 水平内边距：`px-4`（16px）
- 按钮间距：`gap-2`（8px）
- 关闭按钮尺寸：`w-3 h-3`（12px 直径）
- 工具按钮尺寸：`h-7 w-7`（28px）

**颜色方案（保持现有风格）：**
- 背景：`bg-card`（白色 - oklch(1 0 0)）
- 边框：`border-b border-border/50`（浅灰色半透明）
- 关闭按钮：`bg-destructive`（红色 - oklch(0.577 0.245 27.325)）
- 关闭按钮悬停：`hover:bg-destructive/80`（80% 不透明度）
- 工具按钮：使用现有 `Button` 组件的 `ghost` 变体

**交互状态：**
- 关闭按钮：
  - 默认：红色圆形，不透明度 100%
  - 悬停：不透明度降至 80%
  - 过渡：`transition-colors`
- 工具按钮：继承 `Button` 组件的 `ghost` 变体样式
  - 悬停：`hover:bg-accent hover:text-accent-foreground`

#### 拖动区域设计

**实现方式：**
使用 `data-tauri-drag-region` 属性标记可拖动区域。

**拖动区域范围：**
- 整个标题栏容器作为拖动区域
- 交互元素（按钮）不应用拖动属性，以防止冲突

**HTML 结构：**
```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
  {/* 左侧：关闭按钮 + 工具按钮 */}
  <div className="flex items-center gap-2" data-tauri-drag-region>
    <button
      className="w-3 h-3 rounded-full bg-destructive hover:bg-destructive/80 transition-colors"
      onClick={handleClose}
      aria-label="关闭窗口"
    />
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addTodo}>
      <Plus className="h-4 w-4" />
    </Button>
    {/* 其他按钮... */}
  </div>
  
  {/* 右侧：侧边栏切换按钮 */}
  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSidebar}>
    {sidebarVisible ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
  </Button>
</div>
```

**设计决策：**
- 将 `data-tauri-drag-region` 应用于按钮容器，而不是单个按钮
- 按钮本身不应用拖动属性，确保点击事件正常工作
- 使用 flexbox 布局保持响应式

### 4. 窗口控制逻辑

#### 关闭窗口功能

**实现位置：** `src/components/todo-window.tsx`

**代码设计：**
```typescript
import { getCurrentWindow } from '@tauri-apps/api/window';

// 在组件内部
const handleClose = async () => {
  try {
    await getCurrentWindow().close();
  } catch (error) {
    console.error('Failed to close window:', error);
  }
};
```

**设计决策：**
- 使用异步函数处理关闭操作
- 添加错误处理以提高健壮性
- 不需要确认对话框（简单的待办应用）

#### 窗口拖动功能

**实现方式：**
使用 `data-tauri-drag-region` 属性，Tauri 会自动处理拖动逻辑。

**备选方案（手动实现）：**
如果需要更精细的控制，可以使用：
```typescript
const handleDragStart = async (e: React.MouseEvent) => {
  if (e.buttons === 1) { // 左键
    try {
      await getCurrentWindow().startDragging();
    } catch (error) {
      console.error('Failed to start dragging:', error);
    }
  }
};
```

**设计决策：**
- 优先使用 `data-tauri-drag-region` 属性（更简单、更可靠）
- 仅在需要自定义行为时使用手动实现

### 5. 样式设计

#### CSS 类设计

**标题栏容器：**
```css
.flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0
```
- `flex items-center justify-between`：水平布局，垂直居中，两端对齐
- `px-4 py-3`：水平 16px，垂直 12px 内边距
- `border-b border-border/50`：底部边框，50% 不透明度
- `flex-shrink-0`：防止标题栏被压缩

**关闭按钮：**
```css
.w-3 h-3 rounded-full bg-destructive hover:bg-destructive/80 transition-colors
```
- `w-3 h-3`：12px × 12px
- `rounded-full`：完全圆形
- `bg-destructive`：使用主题的 destructive 颜色（红色）
- `hover:bg-destructive/80`：悬停时 80% 不透明度
- `transition-colors`：颜色过渡动画

**按钮容器：**
```css
.flex items-center gap-2
```
- `flex items-center`：水平布局，垂直居中
- `gap-2`：8px 间距

#### 无需新增 CSS
所有样式都使用 Tailwind CSS 实用类，无需添加自定义 CSS。

### 6. 响应式设计

**窗口大小约束：**
- 最小宽度：400px
- 最小高度：500px
- 默认大小：600px × 700px

**标题栏适配：**
- 使用 flexbox 自动适应窗口宽度
- 按钮大小固定，不随窗口缩放
- 拖动区域自动填充剩余空间

**设计决策：**
- 不需要媒体查询（桌面应用，窗口大小可控）
- 保持简单的布局，避免复杂的响应式逻辑

### 7. 可访问性设计

**键盘导航：**
- 所有按钮都可通过 Tab 键访问
- 使用 Button 组件的内置焦点样式

**屏幕阅读器：**
- 关闭按钮添加 `aria-label="关闭窗口"`
- 其他按钮通过图标和上下文提供语义

**焦点指示：**
- 使用 Button 组件的 `focus-visible:ring` 样式
- 关闭按钮需要添加焦点样式：
  ```css
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50
  ```

### 8. 错误处理

**窗口 API 调用失败：**
- 捕获异常并记录到控制台
- 不向用户显示错误（避免干扰）
- 在开发环境中提供详细错误信息

**权限不足：**
- 确保 capabilities 配置正确
- 在开发阶段测试权限

## 技术决策

### 决策 1：不提取独立组件
**理由：**
- 标题栏逻辑简单，与 TodoWindow 紧密耦合
- 避免过度工程化
- 减少文件数量和复杂度

**权衡：**
- 优点：代码更简洁，易于维护
- 缺点：如果未来需要多个窗口，可能需要重构

### 决策 2：使用 data-tauri-drag-region
**理由：**
- Tauri 官方推荐方式
- 自动处理平台差异
- 代码更简洁

**权衡：**
- 优点：可靠性高，代码少
- 缺点：灵活性较低（但当前需求足够）

### 决策 3：保持现有 UI 风格
**理由：**
- 用户要求保持 UI 风格
- 使用现有的设计系统（Tailwind CSS、Radix UI）
- 保持视觉一致性

**实现：**
- 使用现有的颜色变量（`--destructive`、`--border` 等）
- 使用现有的 Button 组件
- 遵循现有的间距和尺寸约定

### 决策 4：最小权限原则
**理由：**
- 安全性考虑
- 仅添加必需的权限（close、start-dragging）
- 不添加未使用的权限（minimize、maximize）

## 数据流

### 窗口关闭流程
```
用户点击关闭按钮
    ↓
handleClose() 函数
    ↓
getCurrentWindow().close()
    ↓
Tauri 窗口 API
    ↓
窗口关闭
```

### 窗口拖动流程
```
用户在拖动区域按下鼠标
    ↓
data-tauri-drag-region 属性
    ↓
Tauri 自动处理拖动
    ↓
窗口跟随鼠标移动
```

## 兼容性

### 平台支持
- **macOS**：完全支持（主要目标平台）
- **Windows**：支持（可能需要调整样式）
- **Linux**：支持（可能需要调整样式）

### 浏览器兼容性
不适用（Tauri 桌面应用）

## 性能考虑

### 渲染性能
- 标题栏为静态组件，不频繁重渲染
- 使用 CSS 过渡而非 JavaScript 动画
- 避免不必要的状态更新

### 内存占用
- 不增加显著的内存开销
- 不引入新的依赖

## 安全性

### 权限控制
- 仅授予必需的窗口权限
- 遵循 Tauri 安全最佳实践

### XSS 防护
- 不涉及用户输入渲染
- 使用 React 的内置 XSS 防护

## 测试策略

### 单元测试
- 测试 handleClose 函数
- 测试按钮点击事件

### 集成测试
- 测试窗口关闭功能
- 测试窗口拖动功能
- 测试按钮功能（添加、设置等）

### 手动测试
- 在 macOS 上测试所有功能
- 测试不同窗口大小
- 测试键盘导航
- 测试可访问性

## 实施计划

实施将在任务阶段详细分解，但大致顺序如下：

1. 修改 Tauri 配置文件
2. 更新权限配置
3. 修改 TodoWindow 组件
4. 添加窗口控制逻辑
5. 测试和调试
6. 文档更新

## 风险和缓解

### 风险 1：平台兼容性问题
**缓解：** 在多个平台上测试，使用 Tauri 官方推荐的 API

### 风险 2：拖动区域与按钮冲突
**缓解：** 正确使用 `data-tauri-drag-region`，不应用于交互元素

### 风险 3：样式不一致
**缓解：** 严格遵循现有设计系统，使用现有组件和颜色变量

## 未来扩展

### 可能的增强功能
- 添加最小化/最大化按钮
- 添加窗口标题显示
- 支持双击标题栏最大化
- 自定义主题颜色

### 不在当前范围
- 窗口透明度
- 毛玻璃效果
- 动画过渡
- 多窗口支持

