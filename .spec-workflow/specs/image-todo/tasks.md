# ImageTodo - 生产级任务分解文档

## 任务概述

本文档将 ImageTodo 项目分解为具体的实现任务，采用 UI-First 开发策略，确保每个任务完成后都有可见的界面变化和可测试的功能。所有任务都遵循生产级开发标准。

## 任务状态说明
- `[ ]` 待开始
- `[-]` 进行中  
- `[x]` 已完成

## 第一阶段：项目基础架构和开发环境（UI-First 基础）

### 阶段目标
建立生产级项目结构，配置开发环境，实现基础 UI 框架，确保开发团队能够立即看到可工作的界面。

### T001: 初始化 Tauri 项目结构
- [x] **任务描述**: 创建 Tauri 项目基础结构，配置生产级构建设置
- **文件路径**: 
  - `src-tauri/Cargo.toml`
  - `src-tauri/tauri.conf.json`
  - `src-tauri/src/main.rs`
- **需求引用**: FR-002 (无边框窗口), TC-001 (技术栈), NFR-006 (代码质量)
- **验收标准**:
  - Tauri 项目成功初始化
  - 无边框窗口配置完成
  - 基础安全配置就位
  - 项目可以成功构建和运行

**_Prompt**: 
```
实现 ImageTodo 项目的 T001 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: Tauri 架构师 - 负责建立生产级 Tauri 项目基础架构

Task: 初始化 Tauri 项目结构，配置无边框窗口和生产级构建设置
- 创建 Tauri 2.0 项目基础结构
- 配置无边框、可拖拽窗口 (320x400 初始尺寸)
- 设置生产级安全配置 (最小权限原则)
- 配置离线优先构建设置
- 确保项目可以成功构建和运行

Restrictions: 
- 严禁添加任何网络相关依赖
- 必须使用 Tauri 2.0 最新稳定版
- 窗口必须无边框且支持拖拽
- 安全配置必须遵循最小权限原则

_Leverage: 
- 参考 .spec-workflow/specs/image-todo/design.md 中的 Tauri 配置
- 使用 requirements.md 中的技术约束
- 遵循 design.md 中的安全设置

_Requirements: FR-002, TC-001, NFR-006

Success: 
- Tauri 项目成功创建并可运行
- 窗口显示为无边框且可拖拽
- 构建过程无错误和警告
- 安全配置通过检查

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

### T002: 配置 TypeScript 严格模式和路径映射
- [x] **任务描述**: 设置 TypeScript 严格配置，配置路径映射，建立类型安全基础
- **文件路径**:
  - `tsconfig.json`
  - `tsconfig.node.json`
  - `src/types/index.ts`
- **需求引用**: NFR-006 (代码质量), TC-001 (技术栈)
- **验收标准**:
  - TypeScript 严格模式启用
  - 路径映射配置完成 (@/ -> src/)
  - 基础类型定义创建
  - 零 TypeScript 错误

**_Prompt**:
```
实现 ImageTodo 项目的 T002 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: TypeScript 架构师 - 负责建立生产级 TypeScript 配置和类型系统

Task: 配置 TypeScript 严格模式和路径映射
- 设置 TypeScript 严格模式配置
- 配置路径映射 (@/ -> src/)
- 创建基础类型定义文件
- 确保零 TypeScript 错误和警告

Restrictions:
- 必须启用所有严格模式选项
- 禁止使用 any 类型
- 路径映射必须支持开发和构建环境
- 类型定义必须完整且准确

_Leverage:
- 参考 design.md 中的 TypeScript 配置要求
- 使用 requirements.md 中的代码质量标准
- 遵循生产级 TypeScript 最佳实践

_Requirements: NFR-006, TC-001

Success:
- TypeScript 严格模式成功启用
- 路径映射在 IDE 和构建中正常工作
- 基础类型定义创建完成
- 项目编译无错误和警告

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

### T003: 配置 Vite 生产级构建和开发工具
- [x] **任务描述**: 设置 Vite 构建工具，配置生产优化和开发服务器
- **文件路径**:
  - `vite.config.ts`
  - `package.json`
  - `.env.example`
- **需求引用**: TC-001 (技术栈), NFR-001 (性能要求)
- **验收标准**:
  - Vite 配置优化完成
  - 开发服务器热重载正常
  - 生产构建优化启用
  - 构建产物大小合理

**_Prompt**:
```
实现 ImageTodo 项目的 T003 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: 前端构建工程师 - 负责配置生产级构建工具和开发环境

Task: 配置 Vite 生产级构建和开发工具
- 设置 Vite 5.0+ 配置文件
- 配置开发服务器 (端口 5173)
- 启用生产构建优化 (代码分割、压缩、Tree Shaking)
- 配置资源处理和路径解析

Restrictions:
- 必须支持 TypeScript 和 React
- 构建产物必须优化 (< 1MB 初始包大小)
- 开发服务器必须支持热重载
- 必须支持 Tauri 集成

_Leverage:
- 参考 design.md 中的 Vite 配置要求
- 使用 requirements.md 中的性能标准
- 集成 TypeScript 路径映射配置

_Requirements: TC-001, NFR-001

Success:
- Vite 开发服务器成功启动
- 热重载功能正常工作
- 生产构建成功且产物优化
- 与 Tauri 集成无问题

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

### T004: 建立项目目录结构和包管理
- [x] **任务描述**: 创建生产级项目目录结构，配置 package.json 和依赖管理
- **文件路径**:
  - `package.json`
  - `pnpm-lock.yaml`
  - `src/` 目录结构
- **需求引用**: TC-001 (技术栈), NFR-006 (代码质量)
- **验收标准**:
  - 目录结构清晰且符合最佳实践
  - 所有必要依赖正确安装
  - 开发脚本配置完成
  - 依赖版本锁定

**_Prompt**:
```
实现 ImageTodo 项目的 T004 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: 项目架构师 - 负责建立生产级项目结构和依赖管理

Task: 建立项目目录结构和包管理
- 创建清晰的 src/ 目录结构 (components/, hooks/, stores/, services/, utils/)
- 配置 package.json 包含所有必要依赖
- 设置开发、构建、测试脚本
- 使用 pnpm 管理依赖并锁定版本

Restrictions:
- 严禁添加网络相关依赖
- 必须使用 pnpm 作为包管理器
- 依赖版本必须明确指定
- 目录结构必须支持 UI-First 开发

_Leverage:
- 参考 design.md 中的组件架构设计
- 使用 requirements.md 中的技术栈要求
- 遵循生产级项目结构最佳实践

_Requirements: TC-001, NFR-006

Success:
- 项目目录结构创建完成
- 所有依赖成功安装
- 开发脚本可以正常运行
- 项目结构支持后续开发

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

### T005: 配置代码质量工具链
- [x] **任务描述**: 设置 ESLint、Prettier、Husky 等代码质量工具
- **文件路径**:
  - `.eslintrc.js`
  - `.prettierrc`
  - `.husky/pre-commit`
  - `lint-staged.config.js`
- **需求引用**: NFR-006 (代码质量), TC-004 (开发环境)
- **验收标准**:
  - ESLint 配置零警告
  - Prettier 自动格式化
  - Git 钩子正常工作
  - 代码质量检查通过

**_Prompt**:
```
实现 ImageTodo 项目的 T005 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: 代码质量工程师 - 负责建立生产级代码质量保证体系

Task: 配置代码质量工具链
- 设置 ESLint 配置 (TypeScript + React + 无障碍规则)
- 配置 Prettier 代码格式化
- 安装 Husky Git 钩子
- 配置 lint-staged 提交前检查

Restrictions:
- ESLint 必须零警告策略
- Prettier 配置必须与团队一致
- Git 钩子必须在提交前运行检查
- 所有规则必须支持 TypeScript

_Leverage:
- 参考 design.md 中的代码质量要求
- 使用 requirements.md 中的质量标准
- 遵循 React 和 TypeScript 最佳实践

_Requirements: NFR-006, TC-004

Success:
- ESLint 检查通过且零警告
- Prettier 格式化正常工作
- Git 提交前检查正常运行
- 代码质量工具链完整配置

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

## 第二阶段：基础 UI 框架和设计系统（立即可见）

### 阶段目标
实现基础 UI 框架，建立设计系统，创建主窗口布局，确保用户可以立即看到应用界面。

### T006: 创建 CSS 设计令牌系统
- [x] **任务描述**: 建立 macOS 风格的设计令牌系统，包括颜色、间距、字体等
- **文件路径**:
  - `src/styles/tokens.css`
  - `src/styles/globals.css`
  - `src/styles/themes.css`
- **需求引用**: FR-009 (macOS 风格), UI-002 (视觉设计)
- **验收标准**:
  - 设计令牌系统完整
  - macOS 风格颜色和间距
  - 支持浅色/深色主题
  - CSS 变量正确定义

**_Prompt**:
```
实现 ImageTodo 项目的 T006 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: UI 设计系统工程师 - 负责建立生产级设计令牌系统

Task: 创建 CSS 设计令牌系统
- 建立 macOS 风格设计令牌 (颜色、间距、字体、圆角)
- 创建浅色/深色主题支持
- 设置响应式间距系统
- 配置 CSS 自定义属性

Restrictions:
- 必须遵循 macOS Human Interface Guidelines
- 颜色必须支持自适应背景
- 间距必须使用 8px 基础网格
- 字体必须使用系统字体栈

_Leverage:
- 参考 requirements.md 中的 macOS 风格要求
- 使用 design.md 中的设计令牌规范
- 遵循 Apple HIG 设计原则

_Requirements: FR-009, UI-002

Success:
- 设计令牌系统创建完成
- 主题切换功能正常
- 颜色和间距符合 macOS 标准
- CSS 变量在浏览器中正确显示

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

### T007: 实现主窗口容器组件
- [x] **任务描述**: 创建主应用窗口容器，实现无边框窗口和拖拽功能
- **文件路径**:
  - `src/components/layout/AppShell/AppShell.tsx`
  - `src/components/layout/AppShell/AppShell.module.css`
  - `src/App.tsx`
- **需求引用**: FR-002 (无边框窗口), FR-003 (动态高度)
- **验收标准**:
  - 主窗口容器正确渲染
  - 无边框设计实现
  - 窗口拖拽功能正常
  - 基础布局结构完成

**_Prompt**:
```
实现 ImageTodo 项目的 T007 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: UI 组件开发工程师 - 负责实现核心窗口容器组件

Task: 实现主窗口容器组件
- 创建 AppShell 主容器组件
- 实现无边框窗口设计 (12px 圆角)
- 添加窗口拖拽功能 (data-tauri-drag-region)
- 建立基础布局结构 (header + content)

Restrictions:
- 窗口必须支持拖拽移动
- 设计必须遵循 macOS 风格
- 组件必须使用 TypeScript 严格模式
- CSS 必须使用 CSS Modules

_Leverage:
- 参考 design.md 中的窗口设计规范
- 使用 tokens.css 中的设计令牌
- 遵循 requirements.md 中的 UI 要求

_Requirements: FR-002, FR-003

Success:
- 主窗口容器成功渲染
- 窗口拖拽功能正常工作
- 无边框设计符合 macOS 标准
- 布局结构支持后续组件

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

### T008: 配置测试框架和工具
- [x] **任务描述**: 设置 Vitest、React Testing Library 和测试环境
- **文件路径**:
  - `vitest.config.ts`
  - `src/test/setup.ts`
  - `src/test/helpers/render.tsx`
- **需求引用**: TR-001 (单元测试), NFR-006 (代码质量)
- **验收标准**:
  - Vitest 配置完成
  - 测试环境正确设置
  - 覆盖率报告配置
  - 示例测试通过

**_Prompt**:
```
实现 ImageTodo 项目的 T008 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: 测试工程师 - 负责建立生产级测试框架和环境

Task: 配置测试框架和工具
- 设置 Vitest 测试框架配置
- 配置 React Testing Library 和 jsdom 环境
- 设置测试覆盖率报告 (≥90% 目标)
- 创建测试辅助函数和模拟对象

Restrictions:
- 测试覆盖率阈值必须设置为 90%
- 必须支持 TypeScript 和 React 组件测试
- 测试环境必须隔离且可重复
- 必须包含 Tauri API 模拟

_Leverage:
- 参考 design.md 中的测试架构设计
- 使用 requirements.md 中的测试要求
- 遵循测试最佳实践

_Requirements: TR-001, NFR-006

Success:
- Vitest 测试框架成功配置
- 测试覆盖率报告正常生成
- 示例组件测试通过
- 测试环境完整且稳定

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

### T009: 创建基础 UI 组件库
- [x] **任务描述**: 实现基础 UI 组件 (Button, Input, Card)
- **文件路径**:
  - `src/components/ui/Button/Button.tsx`
  - `src/components/ui/Input/Input.tsx`
  - `src/components/ui/Card/Card.tsx`
- **需求引用**: FR-009 (macOS 风格), UI-002 (视觉设计)
- **验收标准**:
  - 基础组件实现完成
  - macOS 风格设计
  - 组件可复用且类型安全
  - 单元测试覆盖

**_Prompt**:
```
实现 ImageTodo 项目的 T009 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: UI 组件开发工程师 - 负责实现生产级基础 UI 组件

Task: 创建基础 UI 组件库
- 实现 Button 组件 (primary, secondary, danger 变体)
- 实现 Input 组件 (文本输入、验证状态)
- 实现 Card 组件 (任务卡片容器)
- 为每个组件编写单元测试

Restrictions:
- 组件必须遵循 macOS 设计规范
- 必须使用 TypeScript 接口定义 props
- CSS 必须使用 CSS Modules
- 每个组件必须有对应的测试文件

_Leverage:
- 使用 tokens.css 中的设计令牌
- 参考 requirements.md 中的 macOS 风格要求
- 遵循 React 组件最佳实践

_Requirements: FR-009, UI-002

Success:
- 基础 UI 组件成功创建
- 组件在 Storybook 中正确显示
- 所有组件测试通过
- 组件符合 macOS 设计标准

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

## 第三阶段：核心功能实现（功能可用）

### 阶段目标
实现核心任务管理功能，建立状态管理和数据持久化，确保基础功能完全可用。

- [x] **任务描述**: 设置 Zustand 状态管理，实现任务和设置状态
- **文件路径**:
  - `src/stores/todoStore.ts`
  - `src/stores/settingsStore.ts`
  - `src/stores/index.ts`
- **需求引用**: TC-001 (技术栈), DR-001 (数据模型)
- **验收标准**:
  - todoStore 以单列表模型初始化并提供首行空任务
  - 状态切换循环 todo → doing → done，并在删除后确保至少保留一行
  - 持久化中间件配置完成且键名符合规范
  - 状态操作具备完整测试覆盖

**_Prompt**:
```
实现 ImageTodo 项目的 T010 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: 状态管理架构师 - 负责实现生产级状态管理系统

Task: 实现状态管理架构
- 创建 Zustand todoStore（单列表任务模型，支持新增、状态切换、标题更新、删除）
- 创建 settingsStore (应用设置管理)
- 配置状态持久化中间件
- 实现状态操作的 TypeScript 类型

Restrictions:
- 状态必须完全类型安全
- 必须支持状态持久化
- 删除操作需保证列表至少保留一行
- 状态操作必须是纯函数并包含错误处理

_Leverage:
- 参考 design.md 中的状态管理设计
- 使用 requirements.md 中的数据模型
- 遵循 Zustand 最佳实践

_Requirements: TC-001, DR-001

Success:
- Zustand stores 成功创建
- 状态持久化正常工作
- 状态操作类型安全并覆盖核心交互
- 状态管理测试通过

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

- [x] **任务描述**: 创建任务列表和任务项组件，实现基础交互
- **文件路径**:
  - `src/components/features/TodoList/TodoList.tsx`
  - `src/components/features/TodoList/TodoList.module.css`
  - `src/components/features/TodoItem/TodoItem.tsx`
  - `src/components/features/TodoItem/TodoItem.module.css`
- **需求引用**: FR-001 (任务管理), UI-002 (视觉设计)
- **验收标准**:
  - 窗体只展示单列表格布局，默认仅渲染一行
  - 点击或在末行回车自动新增下一行并聚焦
  - 状态圆形图标使用统一图标库并支持 todo → doing → done 切换
  - 悬停呈现删除按钮，删除后仍保留可编辑空行
  - UI 与 macOS 风格保持一致并通过单元测试

**_Prompt**:
```
实现 ImageTodo 项目的 T011 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: 功能组件开发工程师 - 负责实现核心任务管理 UI 组件

Task: 实现任务列表 UI 组件
- 创建 TodoList 容器组件（占满窗口的单列表格布局）
- 实现 TodoItem 行（状态圆形图标、内联编辑、悬浮删除按钮）
- 支持点击末行或回车自动追加新行并聚焦
- 集成 Zustand 状态管理与持久化交互

Restrictions:
- 组件必须连接到 todoStore 并复用其自动补行逻辑
- UI 必须遵循 macOS 设计规范
- 交互需覆盖键盘与鼠标（点击、悬停、Enter）
- 所有变化需有配套单元测试

_Leverage:
- 使用已创建的基础 UI 组件
- 连接 todoStore 状态管理
- 参考 requirements.md 中的功能需求

_Requirements: FR-001, UI-002

Success:
- 任务列表正确渲染
- 任务 CRUD 操作正常工作
- 自动新增与删除场景表现稳定
- UI 交互流畅且符合预期
- 组件测试覆盖核心行为

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

### T012: 实现数据持久化服务
- [x] **任务描述**: 创建本地数据存储服务，实现 Tauri 文件系统集成
- **文件路径**:
  - `src/services/todoStorage.ts`
  - `src/stores/todoStore.ts`
  - `src-tauri/src/storage.rs`
  - `src-tauri/src/lib.rs`
  - `src-tauri/Cargo.toml`
- **需求引用**: DR-002 (数据持久化), FR-010 (离线优先)
- **验收标准**:
  - Rust 端提供原子写入与备份恢复的 `load_todos` / `save_todos` 命令
  - 前端存储服务封装支持 Tauri 与浏览器双环境并接入 todoStore
  - Zustand store 使用文件持久化并始终保留至少一条可编辑任务
  - 单元测试覆盖加载、保存、删除等关键路径

**_Prompt**:
```
实现 ImageTodo 项目的 T012 任务。首先运行 spec-workflow-guide 获取工作流程指南，然后实现任务：

Role: 后端服务工程师 - 负责实现生产级数据持久化系统

Task: 实现数据持久化服务
- 创建 Rust 存储服务 (JSON 文件读写 + 备份)
- 实现 Tauri 命令接口 (`load_todos`, `save_todos`)
- 添加原子写入和错误回退机制
- 创建前端存储服务封装并接入状态管理

Restrictions:
- 数据写入必须是原子性的
- 必须包含数据完整性验证
- 错误处理必须完善
- 严禁任何网络操作

_Leverage:
- 参考 design.md 中的数据架构设计
- 使用 requirements.md 中的离线优先要求
- 遵循 Tauri 安全最佳实践

_Requirements: DR-002, FR-010

Success:
- 数据持久化服务正常工作并通过测试验证
- 数据完整性通过原子写入与备份得到保证
- 错误处理覆盖所有核心场景
- 前后端集成无问题

Instructions: 在 tasks.md 中将此任务标记为进行中 [-]，完成后标记为已完成 [x]
```

## 任务执行指南

### 开发流程
1. **UI-First 原则**: 每个任务完成后都应该有可见的界面变化
2. **测试驱动**: 每个组件和功能都必须有对应的测试
3. **渐进增强**: 从基础功能开始，逐步添加高级特性
4. **持续集成**: 每个任务完成后都应该通过所有质量检查

### 质量标准
- **代码覆盖率**: 单元测试 ≥ 90%
- **TypeScript**: 严格模式，零 any 类型
- **ESLint**: 零警告策略
- **性能**: 满足 NFR-001 中的性能要求

### 验收流程
1. 功能实现完成
2. 单元测试通过
3. 代码质量检查通过
4. 用户界面验收
5. 任务状态更新为已完成 [x]

---

**注意**: 这是生产级项目的任务分解，每个任务都强调质量、可测试性和用户体验。请严格按照任务描述和验收标准执行。
