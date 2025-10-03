# 交互式屏幕区域截图功能 - 任务分解

## 概述

本文档将交互式屏幕区域截图功能的实现分解为可执行的任务。任务按照依赖关系组织成多个阶段,每个任务都有明确的验收标准。

## 任务状态说明

- `[ ]` 未开始
- `[/]` 进行中
- `[x]` 已完成
- `[-]` 已取消

## 阶段1: 后端基础设施

### 1.1 创建覆盖层窗口函数
**状态**: [x]
**优先级**: 高
**预计时间**: 2小时
**依赖**: 无

**描述**:
在`src-tauri/src/lib.rs`中实现`create_selector_window`函数,用于创建全屏覆盖层窗口。

**任务清单**:
- [x] 导入必要的Tauri模块(`Manager`, `WebviewUrl`, `WebviewWindowBuilder`)
- [x] 导入xcap的`Monitor`模块
- [x] 实现`create_selector_window`函数
  - [x] 检查是否已存在`region-selector`窗口
  - [x] 获取主显示器信息
  - [x] 获取显示器宽度和高度
  - [x] 创建WebviewWindowBuilder
  - [x] 配置窗口属性:
    - [x] `title`: "Region Selector"
    - [x] `inner_size`: 显示器尺寸
    - [x] `position`: (0, 0)
    - [x] `decorations`: false
    - [x] `transparent`: 通过tauri.conf.json配置
    - [x] `always_on_top`: true
    - [x] `skip_taskbar`: true
    - [x] `resizable`: false
    - [x] `fullscreen`: true
  - [x] 构建窗口
  - [x] 错误处理和返回

**验收标准**:
- [x] 函数编译无错误
- [x] 函数返回`Result<(), String>`
- [x] 窗口创建失败时返回错误信息
- [x] 已存在窗口时不重复创建

**测试**:
```rust
// 单元测试
#[cfg(test)]
mod tests {
    #[test]
    fn test_window_creation() {
        // 测试窗口创建逻辑
    }
}
```

---

### 1.2 实现区域截图Tauri命令
**状态**: [x]
**优先级**: 高
**预计时间**: 3小时
**依赖**: 无

**描述**:
实现`capture_screen_region` Tauri命令,接收坐标参数并调用xcap截取屏幕区域。

**任务清单**:
- [x] 定义`ScreenshotResult`结构体
  - [x] `success: bool`
  - [x] `path: Option<String>`
  - [x] `error: Option<String>`
  - [x] 添加`serde::Serialize`和`serde::Deserialize`派生
- [x] 实现`capture_screen_region`函数
  - [x] 添加`#[tauri::command]`属性
  - [x] 接收参数:`app: tauri::AppHandle`, `x: i32`, `y: i32`, `width: u32`, `height: u32`
  - [x] 验证最小尺寸(50x50)
  - [x] 获取主显示器
  - [x] 获取显示器尺寸
  - [x] 边界检查和坐标调整
  - [x] 调用`monitor.capture_region(x, y, width, height)`
  - [x] 生成文件名(使用chrono格式化时间戳)
  - [x] 获取下载文件夹路径(使用dirs库)
  - [x] 保存PNG图片
  - [x] 关闭覆盖层窗口
  - [x] 返回成功结果
  - [x] 错误处理(每个步骤)

**验收标准**:
- [x] 命令编译无错误
- [x] 坐标验证正确(最小50x50)
- [x] 边界检查防止越界
- [x] 文件名格式正确:`screenshot_region_YYYYMMDD_HHMMSS.png`
- [x] 截图保存到下载文件夹
- [x] 覆盖层窗口正确关闭
- [x] 错误情况返回详细错误信息

**测试**:
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_coordinate_validation() {
        // 测试坐标验证逻辑
    }
    
    #[test]
    fn test_boundary_check() {
        // 测试边界检查
    }
    
    #[test]
    fn test_filename_generation() {
        // 测试文件名生成
    }
}
```

---

### 1.3 注册快捷键处理器
**状态**: [x]
**优先级**: 高
**预计时间**: 1.5小时
**依赖**: 1.1

**描述**:
在应用启动时注册Alt+Shift+P快捷键,触发覆盖层窗口创建。

**任务清单**:
- [x] 在`setup`函数中添加区域截图快捷键注册
- [x] 导入`tauri_plugin_global_shortcut`模块
- [x] 解析快捷键字符串"Alt+Shift+P"
- [x] 克隆`app_handle`
- [x] 注册快捷键回调
  - [x] 调用`create_selector_window(&app_handle)`
  - [x] 错误处理(打印到stderr)
- [x] 错误处理(注册失败)

**验收标准**:
- [x] 快捷键注册成功
- [x] 按下Alt+Shift+P触发窗口创建 (已手动测试)
- [x] 注册失败时应用仍能启动
- [x] 错误信息记录到日志

**测试**:
- [x] 手动测试:启动应用,按下Alt+Shift+P
- [x] 验证覆盖层窗口出现

---

### 1.4 注册Tauri命令
**状态**: [x]
**优先级**: 高
**预计时间**: 0.5小时
**依赖**: 1.2

**描述**:
在`invoke_handler`中注册`capture_screen_region`命令。

**任务清单**:
- [x] 在`tauri::generate_handler!`宏中添加`capture_screen_region`
- [x] 确保命令在前端可调用

**验收标准**:
- [x] 编译无错误
- [x] 前端可以通过`invoke('capture_screen_region', {...})`调用 (已测试)

**测试**:
```typescript
// 前端测试
const result = await invoke('capture_screen_region', {
  x: 100, y: 100, width: 200, height: 200
})
```

---

## 阶段2: 前端覆盖层页面

### 2.1 创建覆盖层HTML页面
**状态**: [x]
**优先级**: 高
**预计时间**: 1小时
**依赖**: 无

**描述**:
创建`selector.html`作为覆盖层窗口的入口页面。

**任务清单**:
- [x] 在项目根目录创建`selector.html`
- [x] 设置基本HTML结构
  - [x] DOCTYPE和html标签
  - [x] head部分(charset, viewport, title)
  - [x] body部分(root div)
- [x] 添加内联样式
  - [x] 重置margin和padding
  - [x] 设置body为100vw x 100vh
  - [x] 隐藏overflow
  - [x] 设置crosshair光标
  - [x] 禁用user-select
- [x] 添加script标签引用`/src/selector.tsx`

**验收标准**:
- [x] HTML文件格式正确
- [x] 样式设置正确
- [x] script引用路径正确

**文件内容**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Region Selector</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100vw; height: 100vh; overflow: hidden; cursor: crosshair; user-select: none; }
        #root { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/selector.tsx"></script>
</body>
</html>
```

---

### 2.2 创建覆盖层入口文件
**状态**: [x]
**优先级**: 高
**预计时间**: 0.5小时
**依赖**: 2.1

**描述**:
创建`src/selector.tsx`作为覆盖层的React入口点。

**任务清单**:
- [x] 创建`src/selector.tsx`文件
- [x] 导入React和ReactDOM
- [x] 导入SelectionOverlay组件
- [x] 导入样式文件
- [x] 使用ReactDOM.createRoot渲染组件
- [x] 包裹在React.StrictMode中

**验收标准**:
- [x] 文件编译无错误
- [ ] 组件正确渲染 (待测试)

**文件内容**:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { SelectionOverlay } from './components/selection-overlay'
import './selector.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SelectionOverlay />
  </React.StrictMode>,
)
```

---

### 2.3 创建覆盖层样式文件
**状态**: [x]
**优先级**: 中
**预计时间**: 0.5小时
**依赖**: 2.2

**描述**:
创建`src/selector.css`定义覆盖层的全局样式。

**任务清单**:
- [x] 创建`src/selector.css`文件
- [x] 设置body样式(margin, padding, 尺寸, overflow)
- [x] 设置root样式(100%宽高)

**验收标准**:
- [x] 样式文件格式正确
- [ ] 覆盖层全屏显示 (待测试)

**文件内容**:
```css
body {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

#root {
    width: 100%;
    height: 100%;
}
```

---

## 阶段3: 选择覆盖层组件

### 3.1 创建SelectionOverlay组件骨架
**状态**: [x]
**优先级**: 高
**预计时间**: 1小时
**依赖**: 2.2

**描述**:
创建`src/components/selection-overlay.tsx`的基本结构和状态管理。

**任务清单**:
- [x] 创建`src/components/selection-overlay.tsx`文件
- [x] 导入必要的React hooks(useState, useRef, useEffect)
- [x] 导入Tauri API(invoke, getCurrentWindow)
- [x] 导入toast
- [x] 定义`SelectionRect`接口
  - [x] `startX: number`
  - [x] `startY: number`
  - [x] `endX: number`
  - [x] `endY: number`
- [x] 定义组件状态
  - [x] `isSelecting: boolean`
  - [x] `selection: SelectionRect | null`
- [x] 创建ref: `overlayRef`
- [x] 创建基本JSX结构
  - [x] 外层div(事件处理器)
  - [x] 遮罩层div
  - [x] 选择框div(条件渲染)
  - [x] 尺寸显示div(条件渲染)

**验收标准**:
- [x] 组件编译无错误
- [x] 状态定义正确
- [x] JSX结构完整

---

### 3.2 实现鼠标事件处理
**状态**: [x]
**优先级**: 高
**预计时间**: 2小时
**依赖**: 3.1

**描述**:
实现鼠标按下、移动、释放事件处理器,实现拖拽选择功能。

**任务清单**:
- [x] 实现`handleMouseDown`函数
  - [x] 检查是否为左键(button === 0)
  - [x] 设置`isSelecting`为true
  - [x] 初始化`selection`状态(startX, startY, endX, endY都为当前坐标)
- [x] 实现`handleMouseMove`函数
  - [x] 检查`isSelecting`和`selection`是否存在
  - [x] 更新`selection.endX`和`endY`为当前坐标
- [x] 实现`handleMouseUp`函数
  - [x] 检查`isSelecting`和`selection`是否存在
  - [x] 设置`isSelecting`为false
  - [x] 计算选择区域(x, y, width, height)
  - [x] 检查最小尺寸(50x50)
  - [x] 如果过小,显示toast并重置selection
  - [x] 如果符合要求,调用截图命令(下一个任务)
- [x] 在JSX中绑定事件处理器
  - [x] `onMouseDown={handleMouseDown}`
  - [x] `onMouseMove={handleMouseMove}`
  - [x] `onMouseUp={handleMouseUp}`

**验收标准**:
- [ ] 鼠标按下开始选择 (待测试)
- [ ] 鼠标移动实时更新选择框 (待测试)
- [ ] 鼠标释放完成选择 (待测试)
- [ ] 过小区域显示错误提示 (待测试)

**测试**:
- [ ] 手动测试拖拽选择
- [ ] 测试小于50x50的选择

---

### 3.3 实现截图命令调用
**状态**: [x]
**优先级**: 高
**预计时间**: 1.5小时
**依赖**: 3.2, 1.2

**描述**:
在`handleMouseUp`中调用Rust的`capture_screen_region`命令。

**任务清单**:
- [x] 在`handleMouseUp`中添加截图逻辑
  - [x] 使用try-catch包裹
  - [x] 调用`invoke<{success: boolean, path?: string, error?: string}>('capture_screen_region', {x, y, width, height})`
  - [x] 检查result.success
  - [x] 成功时显示toast.success
  - [x] 失败时显示toast.error(包含错误信息)
  - [x] catch错误时显示通用错误toast
  - [x] 失败时重置selection状态

**验收标准**:
- [ ] 成功截图显示成功toast (待测试)
- [ ] 失败截图显示错误toast (待测试)
- [ ] 覆盖层窗口自动关闭(Rust端处理) (待测试)
- [ ] 截图文件保存到下载文件夹 (待测试)

**测试**:
- [ ] 测试正常截图流程
- [ ] 测试错误场景(如磁盘空间不足)

---

### 3.4 实现取消操作
**状态**: [x]
**优先级**: 中
**预计时间**: 1小时
**依赖**: 3.1

**描述**:
实现Esc键和右键点击取消操作,关闭覆盖层窗口。

**任务清单**:
- [x] 实现`handleContextMenu`函数
  - [x] 阻止默认右键菜单(`e.preventDefault()`)
  - [x] 调用`getCurrentWindow().close()`
- [x] 实现Esc键处理
  - [x] 在useEffect中添加keydown监听器
  - [x] 检查`e.key === 'Escape'`
  - [x] 调用`getCurrentWindow().close()`
  - [x] 清理监听器
- [x] 在JSX中绑定`onContextMenu={handleContextMenu}`

**验收标准**:
- [ ] 右键点击关闭覆盖层 (待测试)
- [ ] 按Esc键关闭覆盖层 (待测试)
- [ ] 不显示浏览器右键菜单 (待测试)

**测试**:
- [ ] 测试右键取消
- [ ] 测试Esc键取消

---

### 3.5 实现选择框样式计算
**状态**: [x]
**优先级**: 高
**预计时间**: 1小时
**依赖**: 3.1

**描述**:
实现选择框和尺寸显示的位置和尺寸计算函数。

**任务清单**:
- [x] 实现`getSelectionStyle`函数
  - [x] 检查selection是否存在
  - [x] 计算x = Math.min(startX, endX)
  - [x] 计算y = Math.min(startY, endY)
  - [x] 计算width = Math.abs(endX - startX)
  - [x] 计算height = Math.abs(endY - startY)
  - [x] 返回样式对象{left, top, width, height}
- [x] 实现`getSizeDisplayStyle`函数
  - [x] 检查selection是否存在
  - [x] 计算选择框右上角位置
  - [x] 返回样式对象{left, top}
- [x] 计算width和height变量(用于显示)
- [x] 在JSX中应用样式

**验收标准**:
- [ ] 选择框位置正确 (待测试)
- [ ] 选择框尺寸正确 (待测试)
- [ ] 支持从任意方向拖拽(左上到右下,右下到左上等) (待测试)
- [ ] 尺寸显示在选择框附近 (待测试)

**测试**:
- [ ] 测试从左上到右下拖拽
- [ ] 测试从右下到左上拖拽
- [ ] 测试从其他方向拖拽

---

### 3.6 创建选择覆盖层样式
**状态**: [x]
**优先级**: 高
**预计时间**: 1.5小时
**依赖**: 3.5

**描述**:
创建`src/components/selection-overlay.css`定义选择UI的样式。

**任务清单**:
- [x] 创建`src/components/selection-overlay.css`文件
- [x] 定义`.selection-overlay`样式
  - [x] position: fixed
  - [x] 全屏尺寸
  - [x] cursor: crosshair
  - [x] user-select: none
- [x] 定义`.overlay-mask`样式
  - [x] position: absolute
  - [x] 全屏尺寸
  - [x] background-color: rgba(0, 0, 0, 0.6)
  - [x] pointer-events: none
- [x] 定义`.selection-box`样式
  - [x] position: absolute
  - [x] border: 3px solid #3b82f6
  - [x] background-color: transparent
  - [x] box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6) (遮罩效果)
  - [x] pointer-events: none
- [x] 定义`.size-display`样式
  - [x] position: absolute
  - [x] background-color: rgba(59, 130, 246, 0.9)
  - [x] color: white
  - [x] padding: 4px 12px
  - [x] border-radius: 4px
  - [x] font-size: 14px
  - [x] font-weight: 600
  - [x] font-family: monospace
  - [x] pointer-events: none
  - [x] white-space: nowrap
  - [x] box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
- [x] 在组件中导入样式

**验收标准**:
- [ ] 遮罩层半透明黑色 (待测试)
- [ ] 选择框蓝色边框 (待测试)
- [ ] 选择框内部透明(通过box-shadow实现) (待测试)
- [ ] 尺寸显示蓝色背景,白色文字 (待测试)
- [ ] 样式美观,符合设计要求 (待测试)

**测试**:
- [ ] 视觉测试:检查遮罩效果
- [ ] 视觉测试:检查选择框样式
- [ ] 视觉测试:检查尺寸显示样式

---

## 阶段4: 快捷键系统集成

### 4.1 扩展快捷键库
**状态**: [x]
**优先级**: 高
**预计时间**: 1.5小时
**依赖**: 无

**描述**:
在`src/lib/shortcuts.ts`中添加区域截图快捷键的注册和管理函数。

**任务清单**:
- [x] 添加`currentRegionCaptureShortcut`变量
- [x] 实现`registerRegionCaptureShortcut`函数
  - [x] 检查与全屏截图快捷键冲突
  - [x] 注销现有快捷键
  - [x] 注册新快捷键
  - [x] 更新`currentRegionCaptureShortcut`
- [x] 实现`unregisterRegionCaptureShortcut`函数
  - [x] 注销快捷键
  - [x] 重置`currentRegionCaptureShortcut`
- [x] 更新`initializeShortcuts`函数
  - [x] 添加`regionCaptureShortcut`参数
  - [x] 调用`registerRegionCaptureShortcut`
- [x] 更新`cleanupShortcuts`函数
  - [x] 调用`unregisterRegionCaptureShortcut`

**验收标准**:
- [x] 快捷键注册成功
- [x] 冲突检测正常工作
- [x] 快捷键可以更新
- [x] 应用关闭时快捷键正确清理

**测试**:
```typescript
// 测试冲突检测
await registerRegionCaptureShortcut('Alt+P') // 应抛出错误

// 测试正常注册
await registerRegionCaptureShortcut('Alt+Shift+P') // 应成功
```

---

### 4.2 扩展设置接口
**状态**: [x]
**优先级**: 中
**预计时间**: 0.5小时
**依赖**: 无

**描述**:
在`src/lib/settings.ts`中添加区域截图快捷键配置。

**任务清单**:
- [x] 在`AppSettings`接口中添加`regionCaptureShortcut: string`
- [x] 在`defaultSettings`中添加`regionCaptureShortcut: 'Alt+Shift+P'`

**验收标准**:
- [x] 类型定义正确
- [x] 默认值设置正确

---

### 4.3 更新主窗口组件
**状态**: [x]
**优先级**: 高
**预计时间**: 2小时
**依赖**: 4.1, 4.2

**描述**:
在`src/components/todo-window.tsx`中集成区域截图快捷键管理。

**任务清单**:
- [x] 添加状态:`const [regionCaptureShortcut, setRegionCaptureShortcut] = useState('Alt+Shift+P')`
- [x] 在`loadAppSettings`中加载`regionCaptureShortcut`
- [x] 更新`initializeShortcuts`调用,传递两个快捷键
- [x] 实现`handleRegionShortcutChange`函数
  - [x] 调用`updateRegionCaptureShortcut`
  - [x] 更新状态
  - [x] 保存到设置
  - [x] 显示成功toast
  - [x] 错误处理
- [x] 在`SettingsPopup`中传递props
  - [x] `regionCaptureShortcut={regionCaptureShortcut}`
  - [x] `onRegionShortcutChange={handleRegionShortcutChange}`

**验收标准**:
- [x] 应用启动时加载快捷键设置
- [x] 快捷键正确注册
- [x] 快捷键可以在设置中修改
- [x] 修改后立即生效

**测试**:
- [ ] 测试默认快捷键
- [ ] 测试修改快捷键
- [ ] 测试快捷键持久化

---

### 4.4 更新设置弹窗UI
**状态**: [x]
**优先级**: 中
**预计时间**: 1小时
**依赖**: 4.3

**描述**:
在`src/components/settings-popup.tsx`中添加区域截图快捷键配置UI。

**任务清单**:
- [x] 在`SettingsPopupProps`接口中添加
  - [x] `regionCaptureShortcut: string`
  - [x] `onRegionShortcutChange: (shortcut: string) => void`
- [x] 在组件参数中解构新props
- [x] 在JSX中添加分隔线
- [x] 添加区域截图快捷键设置区域
  - [x] label: "区域截图快捷键"
  - [x] ShortcutSection组件
  - [x] value: regionCaptureShortcut
  - [x] onChange: onRegionShortcutChange
  - [x] placeholder: "Alt+Shift+P"

**验收标准**:
- [x] UI显示正确
- [x] 快捷键输入框正常工作
- [x] 修改快捷键触发回调
- [x] 样式与现有设置一致

**测试**:
- [ ] 视觉测试:检查UI布局
- [ ] 功能测试:修改快捷键

---

## 阶段5: 构建配置

### 5.1 更新Vite配置
**状态**: [x]
**优先级**: 高
**预计时间**: 1小时
**依赖**: 2.1

**描述**:
配置Vite支持多入口点,包含selector.html。

**任务清单**:
- [x] 打开`vite.config.ts`
- [x] 导入`resolve`函数
- [x] 在`build.rollupOptions.input`中添加
  - [x] `main: resolve(__dirname, 'index.html')`
  - [x] `selector: resolve(__dirname, 'selector.html')`
- [x] 测试构建

**验收标准**:
- [x] 开发模式下selector.html可访问
- [x] 生产构建包含selector.html
- [x] 两个入口点都正确构建

**测试**:
```bash
npm run dev
# 访问 http://localhost:1420/selector.html

npm run build
# 检查 dist/ 目录包含 selector.html
```

---

## 阶段6: 测试

### 6.1 后端单元测试
**状态**: [ ]
**优先级**: 中
**预计时间**: 2小时
**依赖**: 1.2

**描述**:
为后端函数编写单元测试。

**任务清单**:
- [ ] 创建测试模块
- [ ] 测试坐标验证逻辑
  - [ ] 测试最小尺寸检查
  - [ ] 测试边界检查
  - [ ] 测试负数坐标处理
- [ ] 测试文件名生成
  - [ ] 测试格式正确性
  - [ ] 测试唯一性
- [ ] 测试路径处理
  - [ ] 测试下载文件夹获取

**验收标准**:
- [ ] 所有测试通过
- [ ] 代码覆盖率>80%

**测试命令**:
```bash
cd src-tauri
cargo test
```

---

### 6.2 前端组件测试
**状态**: [ ]
**优先级**: 中
**预计时间**: 2小时
**依赖**: 3.6

**描述**:
为前端组件编写测试。

**任务清单**:
- [ ] 测试SelectionOverlay组件
  - [ ] 测试鼠标事件处理
  - [ ] 测试选择框计算
  - [ ] 测试取消操作
- [ ] 测试快捷键函数
  - [ ] 测试注册和注销
  - [ ] 测试冲突检测

**验收标准**:
- [ ] 所有测试通过
- [ ] 组件行为符合预期

**测试命令**:
```bash
npm test
```

---

### 6.3 集成测试
**状态**: [ ]
**优先级**: 高
**预计时间**: 3小时
**依赖**: 所有实现任务

**描述**:
端到端测试完整的区域截图流程。

**任务清单**:
- [ ] 测试快捷键触发
  - [ ] 按下Alt+Shift+P
  - [ ] 验证覆盖层出现
- [ ] 测试选择流程
  - [ ] 拖拽选择区域
  - [ ] 验证选择框显示
  - [ ] 验证尺寸显示
- [ ] 测试截图保存
  - [ ] 释放鼠标
  - [ ] 验证文件保存
  - [ ] 验证toast通知
  - [ ] 验证覆盖层关闭
- [ ] 测试取消操作
  - [ ] 测试Esc键
  - [ ] 测试右键
- [ ] 测试错误场景
  - [ ] 测试过小区域
  - [ ] 测试权限问题

**验收标准**:
- [ ] 所有测试场景通过
- [ ] 无明显bug

---

### 6.4 跨平台测试
**状态**: [ ]
**优先级**: 中
**预计时间**: 4小时
**依赖**: 6.3

**描述**:
在不同操作系统上测试功能。

**任务清单**:
- [ ] Windows测试
  - [ ] 测试基本功能
  - [ ] 测试DPI缩放
  - [ ] 测试多显示器(主显示器)
- [ ] macOS测试
  - [ ] 测试基本功能
  - [ ] 测试Retina显示屏
  - [ ] 测试权限请求
- [ ] Linux测试
  - [ ] 测试X11环境
  - [ ] 测试基本功能

**验收标准**:
- [ ] 所有平台功能正常
- [ ] 坐标计算准确
- [ ] 截图质量良好

---

## 阶段7: 文档和国际化

### 7.1 添加国际化文本
**状态**: [ ]
**优先级**: 中
**预计时间**: 1小时
**依赖**: 无

**描述**:
在`src/lib/i18n.ts`中添加区域截图相关的翻译文本。

**任务清单**:
- [ ] 添加中文翻译
  - [ ] 'region.screenshot.saved'
  - [ ] 'region.screenshot.failed'
  - [ ] 'region.screenshot.too.small'
  - [ ] 'region.shortcut.conflict'
  - [ ] 'region.shortcut.updated'
- [ ] 添加英文翻译
- [ ] 在组件中使用翻译函数

**验收标准**:
- [ ] 所有文本支持中英文
- [ ] 切换语言时文本正确更新

---

### 7.2 更新README
**状态**: [ ]
**优先级**: 低
**预计时间**: 1小时
**依赖**: 所有实现任务

**描述**:
更新项目README,添加区域截图功能说明。

**任务清单**:
- [ ] 在功能列表中添加区域截图
- [ ] 添加使用说明
  - [ ] 快捷键说明
  - [ ] 操作步骤
- [ ] 添加配置说明
- [ ] 添加截图示例

**验收标准**:
- [ ] 文档清晰易懂
- [ ] 包含必要的截图

---

### 7.3 更新CHANGELOG
**状态**: [ ]
**优先级**: 低
**预计时间**: 0.5小时
**依赖**: 所有实现任务

**描述**:
在CHANGELOG中记录新功能。

**任务清单**:
- [ ] 添加版本号
- [ ] 添加功能描述
- [ ] 列出主要变更

**验收标准**:
- [ ] 变更记录完整
- [ ] 格式符合规范

---

## 任务统计

### 按阶段统计
- 阶段1(后端基础设施): 4个任务
- 阶段2(前端覆盖层页面): 3个任务
- 阶段3(选择覆盖层组件): 6个任务
- 阶段4(快捷键系统集成): 4个任务
- 阶段5(构建配置): 1个任务
- 阶段6(测试): 4个任务
- 阶段7(文档和国际化): 3个任务

**总计**: 25个任务

### 按优先级统计
- 高优先级: 15个任务
- 中优先级: 8个任务
- 低优先级: 2个任务

### 预计总时间
约 **35-40小时**

## 实施建议

### 推荐顺序
1. 先完成阶段1(后端)和阶段2(前端页面),建立基础架构
2. 完成阶段3(选择组件),实现核心功能
3. 完成阶段4(快捷键集成),实现完整用户体验
4. 完成阶段5(构建配置),确保可部署
5. 完成阶段6(测试),保证质量
6. 完成阶段7(文档),方便用户使用

### 里程碑
- **里程碑1**: 阶段1+2完成,覆盖层窗口可显示
- **里程碑2**: 阶段3完成,可以选择和截图
- **里程碑3**: 阶段4完成,快捷键完全集成
- **里程碑4**: 阶段5+6完成,功能稳定可发布
- **里程碑5**: 阶段7完成,正式发布

### 风险提示
1. **DPI缩放问题**: 不同DPI设置下坐标可能不准确,需要充分测试
2. **权限问题**: macOS需要屏幕录制权限,需要处理权限请求
3. **性能问题**: 鼠标移动事件频繁,需要优化渲染性能
4. **多显示器**: 当前仅支持主显示器,未来需要扩展

