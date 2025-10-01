# 任务分解：自定义标题栏

## 概述
本文档将设计分解为可执行的原子任务。每个任务都是独立的、可测试的工作单元。

## 任务列表

### 阶段 1：配置修改

#### 任务 1.1：修改 Tauri 窗口配置
- [x] **描述**：在 `src-tauri/tauri.conf.json` 中禁用原生窗口装饰
- **文件**：`src-tauri/tauri.conf.json`
- **修改内容**：
  - 将 `decorations` 从 `true` 改为 `false`
- **需求引用**：FR-1, US-1
- **预计时间**：5 分钟
- **验收标准**：
  - JSON 文件语法正确
  - `decorations` 字段设置为 `false`
  - 其他配置保持不变

**_Prompt:**
```
作为 Tauri 配置专家，修改窗口配置以禁用原生装饰。

任务：修改 src-tauri/tauri.conf.json 文件，将 windows[0].decorations 从 true 改为 false。

限制：
- 不要修改其他配置项
- 保持 JSON 格式正确
- 不要添加注释（JSON 不支持）

成功标准：
- decorations 字段为 false
- JSON 语法有效
- 其他配置不变

完成后，在 tasks.md 中将此任务标记为 [x]。
```

#### 任务 1.2：更新权限配置
- [x] **描述**：在 capabilities 配置中添加窗口控制权限
- **文件**：`src-tauri/capabilities/default.json`
- **修改内容**：
  - 在 `permissions` 数组中添加 `"core:window:allow-close"`
  - 在 `permissions` 数组中添加 `"core:window:allow-start-dragging"`
- **需求引用**：FR-3, TC-2
- **预计时间**：5 分钟
- **验收标准**：
  - JSON 文件语法正确
  - 两个新权限已添加
  - 现有权限保持不变

**_Prompt:**
```
作为 Tauri 安全配置专家，添加窗口控制所需的权限。

任务：修改 src-tauri/capabilities/default.json 文件，在 permissions 数组中添加以下权限：
- "core:window:allow-close"
- "core:window:allow-start-dragging"

限制：
- 保持现有权限不变
- 保持 JSON 格式正确
- 按字母顺序排列权限（可选，但推荐）

_Leverage：
- 查看现有的 permissions 数组结构
- 参考 Tauri v2 权限文档

_Requirements：FR-3, TC-2

成功标准：
- 两个新权限已添加
- JSON 语法有效
- 现有权限未被删除

完成后，在 tasks.md 中将此任务标记为 [x]。
```

### 阶段 2：组件实现

#### 任务 2.1：导入 Tauri 窗口 API
- [x] **描述**：在 TodoWindow 组件中导入 Tauri 窗口 API
- **文件**：`src/components/todo-window.tsx`
- **修改内容**：
  - 在文件顶部添加：`import { getCurrentWindow } from '@tauri-apps/api/window'`
- **需求引用**：TC-2
- **预计时间**：2 分钟
- **验收标准**：
  - 导入语句正确
  - TypeScript 编译无错误

**_Prompt:**
```
作为 React TypeScript 开发者，添加 Tauri 窗口 API 导入。

任务：在 src/components/todo-window.tsx 文件顶部添加 Tauri 窗口 API 的导入语句。

导入语句：
import { getCurrentWindow } from '@tauri-apps/api/window'

限制：
- 将导入语句放在其他导入语句之后
- 保持导入语句的组织结构（React 导入、第三方库、本地导入）

_Leverage：
- 查看文件顶部现有的导入语句
- 遵循现有的导入顺序

_Requirements：TC-2

成功标准：
- 导入语句已添加
- TypeScript 无编译错误
- 导入顺序合理

完成后，在 tasks.md 中将此任务标记为 [x]。
```

#### 任务 2.2：实现窗口关闭处理函数
- [x] **描述**：在 TodoWindow 组件中添加 handleClose 函数
- **文件**：`src/components/todo-window.tsx`
- **修改内容**：
  - 在组件内部添加 `handleClose` 函数
  - 使用 `getCurrentWindow().close()` API
  - 添加错误处理
- **需求引用**：FR-3, US-2
- **预计时间**：10 分钟
- **验收标准**：
  - 函数正确实现
  - 包含错误处理
  - TypeScript 类型正确

**_Prompt:**
```
作为 React TypeScript 开发者，实现窗口关闭处理函数。

任务：在 src/components/todo-window.tsx 的 TodoWindow 组件内部添加 handleClose 函数。

函数实现：
const handleClose = async () => {
  try {
    await getCurrentWindow().close();
  } catch (error) {
    console.error('Failed to close window:', error);
  }
};

位置：
- 在组件内部，其他函数（如 addTodo、toggleTodo）附近
- 在 return 语句之前

限制：
- 使用 async/await 语法
- 包含 try-catch 错误处理
- 使用 console.error 记录错误

_Leverage：
- 参考现有的异步函数（如 loadTodos、saveTodos）
- 使用相同的错误处理模式

_Requirements：FR-3, US-2

成功标准：
- 函数已添加
- 错误处理正确
- TypeScript 无编译错误

完成后，在 tasks.md 中将此任务标记为 [x]。
```

#### 任务 2.3：修改标题栏 HTML 结构
- [x] **描述**：更新标题栏的 HTML 结构，添加拖动区域和关闭按钮功能
- **文件**：`src/components/todo-window.tsx`
- **修改内容**：
  - 在标题栏容器的按钮容器上添加 `data-tauri-drag-region` 属性
  - 为关闭按钮添加 `onClick={handleClose}` 事件
  - 为关闭按钮添加 `aria-label="关闭窗口"`
  - 为关闭按钮添加焦点样式
- **需求引用**：FR-2, FR-3, FR-4, US-2, US-3, NFR-4
- **预计时间**：15 分钟
- **验收标准**：
  - 拖动区域正确标记
  - 关闭按钮功能正常
  - 可访问性属性已添加
  - 样式保持一致

**_Prompt:**
```
作为 React 前端开发者，修改标题栏 HTML 结构以支持自定义窗口控制。

任务：修改 src/components/todo-window.tsx 中的标题栏部分（大约第 94-119 行）。

修改内容：
1. 在包含按钮的 div 上添加 data-tauri-drag-region 属性
2. 为关闭按钮（红色圆形按钮）添加：
   - onClick={handleClose}
   - aria-label="关闭窗口"
   - 焦点样式：focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50

当前结构（第 95-100 行）：
<div className="flex items-center gap-2">
  <button
    className="w-3 h-3 rounded-full bg-destructive hover:bg-destructive/80 transition-colors"
    aria-label="Close"
  />

修改后：
<div className="flex items-center gap-2" data-tauri-drag-region>
  <button
    className="w-3 h-3 rounded-full bg-destructive hover:bg-destructive/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
    onClick={handleClose}
    aria-label="关闭窗口"
  />

限制：
- 不要修改其他按钮
- 保持现有的样式类
- 不要改变布局结构

_Leverage：
- 查看现有的按钮结构
- 参考 Button 组件的焦点样式

_Requirements：FR-2, FR-3, FR-4, US-2, US-3, NFR-4

成功标准：
- data-tauri-drag-region 属性已添加
- 关闭按钮有 onClick 处理函数
- aria-label 为中文
- 焦点样式已添加
- 其他按钮保持不变

完成后，在 tasks.md 中将此任务标记为 [x]。
```

### 阶段 3：测试和验证

#### 任务 3.1：手动测试窗口功能
- [x] **描述**：测试窗口关闭和拖动功能
- **测试内容**：
  - 点击关闭按钮能否关闭窗口
  - 拖动标题栏能否移动窗口
  - 点击其他按钮不会触发拖动
  - 关闭按钮的悬停效果
  - 键盘导航（Tab 键）
  - 焦点样式可见性
- **需求引用**：所有功能需求
- **预计时间**：15 分钟
- **验收标准**：
  - 所有功能正常工作
  - 无控制台错误
  - UI 响应流畅

**_Prompt:**
```
作为 QA 测试工程师，执行手动测试以验证自定义标题栏功能。

任务：运行应用程序并测试以下功能。

测试步骤：
1. 启动应用：npm run tauri dev
2. 测试关闭功能：
   - 点击红色关闭按钮
   - 验证窗口关闭
3. 重新启动应用
4. 测试拖动功能：
   - 在标题栏空白区域点击并拖动
   - 验证窗口跟随鼠标移动
5. 测试按钮功能：
   - 点击加号按钮（应添加待办事项，不触发拖动）
   - 点击设置按钮（应切换语言，不触发拖动）
   - 点击箭头按钮（应切换侧边栏，不触发拖动）
6. 测试视觉效果：
   - 悬停在关闭按钮上，验证不透明度变化
   - 悬停在其他按钮上，验证背景色变化
7. 测试键盘导航：
   - 按 Tab 键导航到关闭按钮
   - 验证焦点环可见
   - 按 Enter 键关闭窗口
8. 检查控制台：
   - 验证无错误信息

限制：
- 在 macOS 上测试（主要目标平台）
- 如果有其他平台，也进行测试

_Requirements：所有功能需求和非功能需求

成功标准：
- 所有测试通过
- 无控制台错误
- UI 流畅响应
- 视觉效果符合设计

如果发现问题，记录并修复后重新测试。
完成后，在 tasks.md 中将此任务标记为 [x]。
```

#### 任务 3.2：验证 TypeScript 编译
- [x] **描述**：确保所有修改通过 TypeScript 编译
- **验证内容**：
  - 运行 `npm run build`
  - 检查是否有 TypeScript 错误
  - 检查是否有 linting 错误
- **需求引用**：NFR-3
- **预计时间**：5 分钟
- **验收标准**：
  - 编译成功
  - 无 TypeScript 错误
  - 无 linting 警告

**_Prompt:**
```
作为构建工程师，验证代码编译和类型检查。

任务：运行构建命令并验证无错误。

命令：
1. npm run build
2. 检查输出，确保无错误

如果有错误：
- 记录错误信息
- 修复类型错误
- 重新运行构建

限制：
- 不要忽略 TypeScript 错误
- 不要使用 @ts-ignore（除非绝对必要）

_Requirements：NFR-3

成功标准：
- 构建成功完成
- 无 TypeScript 错误
- 无严重的 linting 警告

完成后，在 tasks.md 中将此任务标记为 [x]。
```

### 阶段 4：文档和清理

#### 任务 4.1：更新项目文档（可选）
- [x] **描述**：如果需要，更新 README 或其他文档
- **文件**：`README.md`（如果需要）
- **修改内容**：
  - 记录自定义标题栏功能
  - 更新截图（如果有）
- **需求引用**：无（可选任务）
- **预计时间**：10 分钟
- **验收标准**：
  - 文档准确反映新功能

**_Prompt:**
```
作为技术文档编写者，更新项目文档以反映新功能。

任务：检查 README.md 是否需要更新。

可能的更新：
- 添加自定义标题栏功能说明
- 更新功能列表
- 添加截图（如果有）

限制：
- 保持文档简洁
- 使用清晰的语言
- 如果不需要更新，跳过此任务

成功标准：
- 文档准确
- 格式正确
- 或确认不需要更新

完成后，在 tasks.md 中将此任务标记为 [x]。
```

## 任务依赖关系

```
任务 1.1 (Tauri 配置)
    ↓
任务 1.2 (权限配置)
    ↓
任务 2.1 (导入 API)
    ↓
任务 2.2 (关闭函数)
    ↓
任务 2.3 (HTML 结构)
    ↓
任务 3.1 (手动测试)
    ↓
任务 3.2 (编译验证)
    ↓
任务 4.1 (文档更新 - 可选)
```

## 总预计时间
- 配置修改：10 分钟
- 组件实现：27 分钟
- 测试验证：20 分钟
- 文档更新：10 分钟（可选）
- **总计：约 1 小时**

## 注意事项

1. **按顺序执行任务**：任务之间有依赖关系，必须按顺序完成
2. **测试驱动**：每个任务完成后进行快速验证
3. **保持提交小而频繁**：每个任务或阶段完成后提交代码
4. **遇到问题及时记录**：如果遇到意外问题，记录并寻求帮助

## 回滚计划

如果实施过程中遇到严重问题：

1. **配置回滚**：
   - 恢复 `tauri.conf.json` 中的 `decorations: true`
   - 移除添加的权限

2. **代码回滚**：
   - 使用 Git 回滚到实施前的提交
   - 或手动移除添加的代码

3. **重新评估**：
   - 分析问题原因
   - 调整设计或实施方案
   - 重新开始实施

