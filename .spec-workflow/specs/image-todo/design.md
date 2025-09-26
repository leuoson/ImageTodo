# ImageTodo - 生产级离线优先技术设计文档

## 设计概述

ImageTodo 是一个完全离线的跨平台桌面 Todo 应用，基于 Tauri 框架构建，采用生产级开发标准。应用采用"离线优先"(Offline-First) 设计理念，确保在任何网络环境下都能完整运行，同时为未来可能的云同步功能预留架构扩展性。

**本设计文档强调生产级标准**：每个架构决策都考虑了可测试性、可维护性、性能优化和用户体验。

### 核心设计原则（生产级标准）

1. **Offline-First**: 应用完全独立运行，无需任何网络连接
2. **Privacy by Design**: 所有数据保留在本地，用户完全控制
3. **Local Data Authority**: 本地数据始终是权威数据源
4. **Future Extensible**: 架构支持未来云同步扩展，但不影响离线体验
5. **Zero Network Dependency**: 应用代码中不包含任何网络请求
6. **Production Quality**: 代码质量、测试覆盖率、性能监控达到生产级标准
7. **UI-First Development**: 优先实现可视化界面，确保每个功能都有即时可测试的用户界面
8. **Testability by Design**: 架构设计优先考虑可测试性，支持单元测试、集成测试和 E2E 测试
9. **Performance by Design**: 从架构层面考虑性能优化，包括渲染性能、内存管理和启动速度
10. **Error Resilience**: 完善的错误处理和恢复机制，确保应用在异常情况下的稳定性

## 生产级开发流程设计

### UI-First 开发策略
本项目采用 UI-First 开发策略，确保：
- **即时可视化反馈**：每个开发阶段都有可见的界面变化
- **持续功能测试**：用户可以在每个里程碑后进行实际功能测试
- **渐进式功能构建**：从基础 UI 框架开始，逐步添加功能
- **用户体验优先**：界面和交互设计驱动技术实现

### 生产级质量保证
- **测试驱动开发**：单元测试覆盖率 ≥ 90%，集成测试覆盖核心流程
- **代码质量标准**：TypeScript 严格模式，ESLint 零警告，Prettier 格式化
- **性能监控**：实时性能监控，自动化性能回归测试
- **错误处理**：完善的错误边界和用户友好的错误反馈
- **文档驱动**：完整的 API 文档、架构文档和用户指南

## UI-First 生产级架构设计

### UI-First 开发层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                UI-First 开发优先级架构                        │
├─────────────────────────────────────────────────────────────┤
│  第一优先级：基础 UI 框架层 (立即可见)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   窗口容器       │  │   布局系统       │  │  设计令牌    │  │
│  │   (可拖拽)      │  │   (响应式)      │  │  (macOS风格) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  第二优先级：核心组件层 (基础交互)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   任务列表       │  │   输入组件       │  │  按钮组件    │  │
│  │   (可滚动)      │  │   (验证)        │  │  (反馈)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  第三优先级：功能集成层 (完整功能)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   状态管理       │  │   数据持久化     │  │  设置面板    │  │
│  │   (Zustand)     │  │   (本地存储)    │  │  (配置)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  第四优先级：高级功能层 (增强体验)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   系统集成       │  │   性能优化       │  │  错误处理    │  │
│  │   (托盘)        │  │   (监控)        │  │  (边界)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 生产级组件架构设计

```typescript
// 组件层次结构 - UI-First 设计
src/
├── components/           # UI 组件库 (第一优先级)
│   ├── ui/              # 基础 UI 组件
│   │   ├── Window/      # 主窗口容器
│   │   ├── Layout/      # 布局组件
│   │   ├── Button/      # 按钮组件
│   │   ├── Input/       # 输入组件
│   │   └── Card/        # 卡片组件
│   ├── features/        # 功能组件 (第二优先级)
│   │   ├── TodoList/    # 任务列表
│   │   ├── TodoItem/    # 任务项
│   │   ├── AddTodo/     # 添加任务
│   │   └── Settings/    # 设置面板
│   └── layout/          # 布局组件 (第一优先级)
│       ├── AppShell/    # 应用外壳
│       ├── Header/      # 头部组件
│       └── Container/   # 容器组件
├── hooks/               # 自定义 Hooks (第三优先级)
│   ├── useTodos/        # 任务管理
│   ├── useSettings/     # 设置管理
│   └── useWindow/       # 窗口管理
├── stores/              # 状态管理 (第三优先级)
│   ├── todoStore.ts     # 任务状态
│   ├── settingsStore.ts # 设置状态
│   └── windowStore.ts   # 窗口状态
├── services/            # 业务服务 (第三优先级)
│   ├── todoService.ts   # 任务服务
│   ├── storageService.ts# 存储服务
│   └── windowService.ts # 窗口服务
└── utils/               # 工具函数 (支持层)
    ├── validation.ts    # 数据验证
    ├── storage.ts       # 存储工具
    └── theme.ts         # 主题工具
```

## 离线优先架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                ImageTodo 离线优先架构                        │
├─────────────────────────────────────────────────────────────┤
│  用户界面层 (UI Layer)                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   React 组件     │  │   CSS 样式      │  │  TypeScript │  │
│  │   (无网络依赖)   │  │   (macOS 风格)  │  │   类型系统   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  状态管理层 (State Layer)                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Zustand 本地状态管理                        │ │
│  │  TodoStore ←→ SettingsStore ←→ WindowStore             │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  业务逻辑层 (Business Layer)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  任务管理    │  │  设置管理    │  │     窗口管理         │  │
│  │  Service    │  │  Service    │  │     Service         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  IPC 通信层 (IPC Layer)                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Tauri Commands (无网络)                    │ │
│  │  invoke() ←→ Commands ←→ Events ←→ listen()            │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  数据持久化层 (Persistence Layer)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  JSON 存储   │  │  文件备份    │  │     配置管理         │  │
│  │  Engine     │  │  System     │  │     System          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  系统集成层 (System Layer)                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  系统托盘    │  │  文件系统    │  │    操作系统 API      │  │
│  │  (本地)     │  │  (本地)     │  │   (无网络权限)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 生产级技术栈选择

### 前端技术栈（生产级标准）
- **核心框架**: React 18 + TypeScript 5.0+ (严格模式)
- **构建工具**: Vite 5.0+ (生产优化配置)
- **样式方案**: CSS Modules + PostCSS + 设计令牌系统
- **状态管理**: Zustand + 持久化中间件
- **UI 组件**: 自定义组件库 (macOS 风格 + Storybook 文档)
- **测试框架**: Vitest + React Testing Library + MSW (Mock Service Worker)
- **类型安全**: TypeScript 严格模式，零 any 类型
- **网络限制**: 严禁任何 HTTP 客户端库

### 后端技术栈（生产级标准）
- **核心框架**: Tauri 2.0 (最新稳定版)
- **语言**: Rust 1.70+ (stable channel)
- **数据存储**: JSON 文件 (serde_json + 原子写入)
- **文件操作**: std::fs + tokio::fs (异步 I/O)
- **窗口管理**: Tauri Window API + 自定义窗口控制
- **系统集成**: Tauri System Tray Plugin + 平台特定适配
- **错误处理**: anyhow + thiserror (结构化错误处理)
- **日志系统**: tracing + tracing-subscriber (结构化日志)
- **网络限制**: 不包含任何网络相关 crate

### 开发工具链（生产级标准）
- **包管理**: pnpm (前端) + Cargo (后端)
- **代码格式化**: Prettier + Rustfmt (自动格式化)
- **代码检查**: ESLint + Clippy (零警告策略)
- **Git 钩子**: Husky + lint-staged (提交前检查)
- **构建系统**: 完全离线构建流程 + 多平台 CI/CD
- **文档生成**: JSDoc + Rust Doc + mdBook
- **性能分析**: Bundle Analyzer + Rust Profiling Tools

### 测试工具链（生产级标准）
- **单元测试**: Vitest (前端) + Rust 内置测试 (后端)
- **集成测试**: React Testing Library + Tauri 测试工具
- **E2E 测试**: Playwright for Tauri + 自动化测试套件
- **性能测试**: Lighthouse CI + 自定义性能基准
- **覆盖率报告**: c8 (前端) + tarpaulin (后端)
- **视觉回归测试**: Chromatic + 截图对比

### 质量保证工具（生产级标准）
- **静态分析**: TypeScript 编译器 + ESLint + Clippy
- **安全扫描**: npm audit + cargo audit + Snyk
- **依赖管理**: Renovate Bot + 自动化依赖更新
- **代码复杂度**: 复杂度分析工具 + 质量门禁
- **文档检查**: 文档覆盖率检查 + 链接验证

## 离线数据架构

### 本地数据存储设计

```
用户数据目录/
├── ImageTodo/
│   ├── data/
│   │   ├── todos.json          # 主要任务数据
│   │   ├── settings.json       # 应用设置
│   │   └── metadata.json       # 元数据信息
│   ├── backups/               # 自动备份
│   │   ├── todos_backup_1.json
│   │   ├── todos_backup_2.json
│   │   └── settings_backup_1.json
│   ├── exports/               # 用户导出
│   │   └── export_YYYYMMDD.json
│   └── logs/                  # 应用日志 (可选)
│       └── app.log
```

### 数据模型设计

#### 任务数据模型 (为云同步预留字段)

```typescript
interface Todo {
  // 核心字段
  id: string;              // 本地 UUID
  title: string;           // 任务标题
  description?: string;    // 任务描述
  completed: boolean;      // 完成状态
  createdAt: Date;        // 创建时间
  updatedAt: Date;        // 更新时间

  // 扩展字段 (为未来云同步预留)
  syncId?: string;        // 云端同步 ID (预留)
  lastSyncTime?: Date;    // 最后同步时间 (预留)
  conflictResolved?: boolean; // 冲突解决标记 (预留)
  deviceId?: string;      // 设备标识 (预留)

  // 本地字段
  localVersion: number;   // 本地版本号
  deleted?: boolean;      // 软删除标记
}

interface TodoDatabase {
  version: string;        // 数据格式版本
  todos: Todo[];
  lastModified: Date;
  deviceInfo: {
    deviceId: string;     // 本地设备 ID
    platform: string;    // 操作系统
  };

  // 云同步预留字段
  syncMetadata?: {
    lastSyncTime?: Date;
    syncEnabled?: boolean;
    conflictCount?: number;
  };
}
```

#### 设置数据模型

```typescript
interface AppSettings {
  version: string;        // 设置版本

  // 窗口设置
  window: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    alwaysOnTop: boolean;
    pinned: boolean;
    opacity: number;
  };

  // 外观设置
  appearance: {
    theme: 'light' | 'dark' | 'system';
    background: BackgroundSettings;
    fontSize: 'small' | 'medium' | 'large';
  };

  // 背景设置
  background: {
    type: 'glass' | 'transparent' | 'solid' | 'semi';
    opacity: number;
    color?: string;
    glassIntensity?: number;
  };

  // 应用设置
  app: {
    autoStart: boolean;
    minimizeToTray: boolean;
    showInDock: boolean;
    autoBackup: boolean;
    backupInterval: number; // 分钟
  };

  // 云同步预留设置
  sync?: {
    enabled: boolean;
    provider?: 'none' | 'custom';
    lastSyncTime?: Date;
    autoSync?: boolean;
  };
}
```

## 离线业务逻辑设计

### 任务管理服务 (完全本地)

```rust
// src-tauri/src/services/todo_service.rs
pub struct TodoService {
    storage: Arc<Mutex<StorageService>>,
}

impl TodoService {
    // 所有操作都是本地的，无网络依赖
    pub async fn get_todos(&self) -> Result<Vec<Todo>, String> {
        // 从本地文件读取
    }

    pub async fn add_todo(&self, title: String, description: Option<String>) -> Result<Todo, String> {
        // 本地创建，立即保存
    }

    pub async fn update_todo(&self, id: String, updates: TodoUpdate) -> Result<Todo, String> {
        // 本地更新，立即保存
    }

    pub async fn delete_todo(&self, id: String) -> Result<(), String> {
        // 软删除，保留数据用于未来同步
    }

    // 为云同步预留的方法
    pub async fn prepare_for_sync(&self) -> Result<SyncData, String> {
        // 准备同步数据 (未来实现)
    }

    pub async fn apply_sync_changes(&self, changes: SyncChanges) -> Result<(), String> {
        // 应用同步变更 (未来实现)
    }
}
```

### 本地存储服务

```rust
// src-tauri/src/services/storage_service.rs
pub struct StorageService {
    data_dir: PathBuf,
    backup_enabled: bool,
}

impl StorageService {
    pub fn new() -> Result<Self, String> {
        // 初始化本地数据目录
    }

    pub async fn save_todos(&self, todos: &TodoDatabase) -> Result<(), String> {
        // 原子写入 + 自动备份
        self.atomic_write("todos.json", todos).await?;
        if self.backup_enabled {
            self.create_backup("todos.json").await?;
        }
        Ok(())
    }

    pub async fn load_todos(&self) -> Result<TodoDatabase, String> {
        // 加载数据，失败时尝试从备份恢复
    }

    async fn atomic_write<T: Serialize>(&self, filename: &str, data: &T) -> Result<(), String> {
        // 原子写入：写入临时文件 -> 重命名
    }

    async fn create_backup(&self, filename: &str) -> Result<(), String> {
        // 创建带时间戳的备份文件
    }

    pub async fn export_data(&self, export_path: &Path) -> Result<(), String> {
        // 导出所有数据到指定路径
    }

    pub async fn import_data(&self, import_path: &Path) -> Result<(), String> {
        // 从文件导入数据
    }
}
```

## 前端离线架构

### 状态管理 (Zustand - 完全本地)

```typescript
// src/stores/todoStore.ts
interface TodoStore {
  // 本地状态
  todos: Todo[];
  loading: boolean;
  error: string | null;
  lastSaved: Date | null;

  // 本地操作 (无网络)
  loadTodos: () => Promise<void>;
  addTodo: (title: string, description?: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;

  // 数据管理
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
  clearError: () => void;

  // 为云同步预留的方法
  prepareSyncData?: () => SyncData;
  applySyncChanges?: (changes: SyncChanges) => Promise<void>;
}

const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  loading: false,
  error: null,
  lastSaved: null,

  loadTodos: async () => {
    set({ loading: true });
    try {
      const todos = await todoService.getTodos();
      set({ todos, loading: false, error: null });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addTodo: async (title: string, description?: string) => {
    try {
      const newTodo = await todoService.addTodo(title, description);
      set(state => ({
        todos: [...state.todos, newTodo],
        lastSaved: new Date()
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  // ... 其他本地操作
}));
```

### 服务层 (无网络依赖)

```typescript
// src/services/todoService.ts
class TodoService {
  // 所有方法都通过 Tauri IPC 调用本地 Rust 代码

  async getTodos(): Promise<Todo[]> {
    return await invoke('get_todos');
  }

  async addTodo(title: string, description?: string): Promise<Todo> {
    return await invoke('add_todo', { title, description });
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    return await invoke('update_todo', { id, updates });
  }

  async deleteTodo(id: string): Promise<void> {
    return await invoke('delete_todo', { id });
  }

  async exportData(): Promise<void> {
    return await invoke('export_todos');
  }

  async importData(filePath: string): Promise<void> {
    return await invoke('import_todos', { filePath });
  }

  // 为云同步预留的方法 (当前不实现)
  // async syncWithCloud?(): Promise<SyncResult>;
  // async resolveConflicts?(conflicts: Conflict[]): Promise<void>;
}

export const todoService = new TodoService();

## 窗口管理设计 (离线)

### 无边框窗口实现

```rust
// src-tauri/src/commands/window.rs
#[tauri::command]
pub async fn setup_frameless_window(window: tauri::Window) -> Result<(), String> {
    // 设置无边框窗口
    window.set_decorations(false)?;
    window.set_resizable(false)?;
    window.set_always_on_top(false)?;
    Ok(())
}

#[tauri::command]
pub async fn set_window_draggable(window: tauri::Window, draggable: bool) -> Result<(), String> {
    // 控制窗口拖拽
    if draggable {
        window.start_dragging()?;
    }
    Ok(())
}

#[tauri::command]
pub async fn resize_window_height(window: tauri::Window, height: f64) -> Result<(), String> {
    let current_size = window.outer_size()?;
    window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
        width: current_size.width,
        height: height as u32,
    }))?;
    Ok(())
}

#[tauri::command]
pub async fn set_window_opacity(window: tauri::Window, opacity: f64) -> Result<(), String> {
    window.set_opacity(opacity)?;
    Ok(())
}

#[tauri::command]
pub async fn set_always_on_top(window: tauri::Window, always_on_top: bool) -> Result<(), String> {
    window.set_always_on_top(always_on_top)?;
    Ok(())
}
```

### 动态高度计算

```typescript
// src/hooks/useWindowHeight.ts
export const useWindowHeight = () => {
  const todos = useTodoStore(state => state.todos);

  const calculateHeight = useCallback((todoCount: number): number => {
    const headerHeight = 60;      // 头部高度
    const footerHeight = 40;      // 底部高度
    const itemHeight = 48;        // 每个任务项高度
    const padding = 32;           // 总内边距
    const maxHeight = 800;        // 最大高度
    const minHeight = 200;        // 最小高度

    const calculatedHeight = headerHeight + footerHeight + (todoCount * itemHeight) + padding;
    return Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
  }, []);

  const updateWindowHeight = useCallback(async () => {
    const newHeight = calculateHeight(todos.length);
    await windowService.resizeHeight(newHeight);
  }, [todos.length, calculateHeight]);

  useEffect(() => {
    updateWindowHeight();
  }, [updateWindowHeight]);

  return { calculateHeight, updateWindowHeight };
};
```

## macOS 风格设计系统

### CSS 变量系统 (离线主题)

```css
/* src/styles/variables.css */
:root {
  /* 圆角系统 */
  --radius-window: 12px;
  --radius-card: 8px;
  --radius-button: 6px;
  --radius-input: 6px;

  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;

  /* 字体系统 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* 动画系统 */
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.2s ease-out;
  --transition-slow: 0.3s ease-out;

  /* 阴影系统 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* 背景效果系统 */
.background-glass {
  backdrop-filter: blur(var(--glass-blur, 20px));
  background: rgba(255, 255, 255, var(--glass-opacity, 0.8));
}

.background-transparent {
  background: transparent;
}

.background-solid-light {
  background: var(--solid-color, #ffffff);
}

.background-solid-dark {
  background: var(--solid-color, #1f2937);
}

.background-semi {
  background: rgba(255, 255, 255, var(--semi-opacity, 0.5));
}

/* 深色模式 */
[data-theme="dark"] {
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --bg-primary: #1f2937;
  --bg-secondary: #374151;
  --border-color: #4b5563;
}

/* 浅色模式 */
[data-theme="light"] {
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --border-color: #e5e7eb;
}
```

### 组件设计 (macOS 风格)

```typescript
// src/components/TodoItem/TodoItem.tsx
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  return (
    <div className={styles.todoItem} data-completed={todo.completed}>
      <div className={styles.checkbox} onClick={() => onToggle(todo.id)}>
        {todo.completed && <CheckIcon />}
      </div>

      {isEditing ? (
        <input
          className={styles.editInput}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={() => {
            onEdit(todo.id, { title: editTitle });
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onEdit(todo.id, { title: editTitle });
              setIsEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <div
          className={styles.todoContent}
          onDoubleClick={() => setIsEditing(true)}
        >
          <span className={styles.todoTitle}>{todo.title}</span>
          {todo.description && (
            <span className={styles.todoDescription}>{todo.description}</span>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.actionButton}
          onClick={() => setIsEditing(true)}
          aria-label="编辑任务"
        >
          <EditIcon />
        </button>
        <button
          className={styles.actionButton}
          onClick={() => onDelete(todo.id)}
          aria-label="删除任务"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
};
```

```css
/* src/components/TodoItem/TodoItem.module.css */
.todoItem {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-color);
  transition: var(--transition-normal);
  cursor: pointer;
}

.todoItem:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.todoItem[data-completed="true"] {
  opacity: 0.6;
}

.todoItem[data-completed="true"] .todoTitle {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  margin-right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.checkbox:hover {
  border-color: #007AFF;
}

.todoContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.todoTitle {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  color: var(--text-primary);
  line-height: 1.4;
}

.todoDescription {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.3;
}

.editInput {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid #007AFF;
  border-radius: var(--radius-input);
  font-size: var(--font-size-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}

.actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: var(--transition-fast);
}

.todoItem:hover .actions {
  opacity: 1;
}

.actionButton {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: var(--radius-button);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.actionButton:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
  transform: scale(0.95);
}

## 系统托盘集成 (离线)

### 托盘菜单设计

```rust
// src-tauri/src/tray.rs
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent};

pub fn create_system_tray() -> SystemTray {
    let show_hide = CustomMenuItem::new("show_hide".to_string(), "显示/隐藏");
    let settings = CustomMenuItem::new("settings".to_string(), "设置");
    let separator = SystemTrayMenuItem::Separator;
    let quit = CustomMenuItem::new("quit".to_string(), "退出");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show_hide)
        .add_native_item(separator)
        .add_item(settings)
        .add_native_item(separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

pub fn handle_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let window = app.get_window("main").unwrap();
            if window.is_visible().unwrap() {
                window.hide().unwrap();
            } else {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "show_hide" => {
                    let window = app.get_window("main").unwrap();
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                "settings" => {
                    // 打开设置界面
                    let window = app.get_window("main").unwrap();
                    window.emit("open-settings", {}).unwrap();
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            }
        }
        _ => {}
    }
}
```

## 错误处理和恢复 (离线)

### 数据恢复策略

```rust
// src-tauri/src/services/recovery_service.rs
pub struct RecoveryService {
    storage: Arc<Mutex<StorageService>>,
}

impl RecoveryService {
    pub async fn recover_todos(&self) -> Result<TodoDatabase, String> {
        // 1. 尝试加载主数据文件
        if let Ok(todos) = self.storage.lock().await.load_todos().await {
            return Ok(todos);
        }

        // 2. 尝试从最新备份恢复
        if let Ok(todos) = self.load_from_latest_backup().await {
            // 恢复成功，保存为主文件
            self.storage.lock().await.save_todos(&todos).await?;
            return Ok(todos);
        }

        // 3. 创建空的数据库
        let empty_db = TodoDatabase {
            version: "1.0.0".to_string(),
            todos: vec![],
            lastModified: chrono::Utc::now().naive_utc(),
            deviceInfo: DeviceInfo::current(),
            syncMetadata: None,
        };

        self.storage.lock().await.save_todos(&empty_db).await?;
        Ok(empty_db)
    }

    async fn load_from_latest_backup(&self) -> Result<TodoDatabase, String> {
        // 查找最新的备份文件并加载
    }

    pub async fn create_emergency_backup(&self) -> Result<(), String> {
        // 创建紧急备份
    }
}
```

### 前端错误边界

```typescript
// src/components/ErrorBoundary/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // 记录错误到本地日志
    console.error('应用错误:', error, errorInfo);

    // 尝试保存当前状态
    this.saveEmergencyState();
  }

  private async saveEmergencyState() {
    try {
      const currentState = useTodoStore.getState();
      await todoService.createEmergencyBackup(currentState);
    } catch (error) {
      console.error('无法保存紧急状态:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <h2>应用遇到了问题</h2>
          <p>我们已经自动保存了您的数据。</p>
          <button onClick={() => window.location.reload()}>
            重新加载应用
          </button>
          <button onClick={() => this.setState({ hasError: false })}>
            继续使用
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 性能优化 (离线优化)

### 本地缓存策略

```typescript
// src/utils/cache.ts
class LocalCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const localCache = new LocalCache();
```

### 虚拟滚动 (大量任务优化)

```typescript
// src/components/VirtualTodoList/VirtualTodoList.tsx
interface VirtualTodoListProps {
  todos: Todo[];
  itemHeight: number;
  containerHeight: number;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export const VirtualTodoList: React.FC<VirtualTodoListProps> = ({
  todos,
  itemHeight,
  containerHeight,
  onToggle,
  onEdit,
  onDelete
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, todos.length);

  const visibleTodos = todos.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      className={styles.virtualList}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: todos.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleTodos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 测试策略 (离线测试)

### 单元测试

```typescript
// src/services/__tests__/todoService.test.ts
import { todoService } from '../todoService';

// Mock Tauri invoke
const mockInvoke = jest.fn();
jest.mock('@tauri-apps/api/tauri', () => ({
  invoke: mockInvoke
}));

describe('TodoService', () => {
  beforeEach(() => {
    mockInvoke.mockClear();
  });

  test('应该能够获取任务列表', async () => {
    const mockTodos = [
      { id: '1', title: '测试任务', completed: false, createdAt: new Date() }
    ];
    mockInvoke.mockResolvedValue(mockTodos);

    const todos = await todoService.getTodos();

    expect(mockInvoke).toHaveBeenCalledWith('get_todos');
    expect(todos).toEqual(mockTodos);
  });

  test('应该能够添加新任务', async () => {
    const newTodo = { id: '2', title: '新任务', completed: false, createdAt: new Date() };
    mockInvoke.mockResolvedValue(newTodo);

    const result = await todoService.addTodo('新任务');

    expect(mockInvoke).toHaveBeenCalledWith('add_todo', { title: '新任务', description: undefined });
    expect(result).toEqual(newTodo);
  });
});
```

### 集成测试

```rust
// src-tauri/src/tests/integration_tests.rs
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_todo_crud_operations() {
        let temp_dir = TempDir::new().unwrap();
        let storage = StorageService::new_with_path(temp_dir.path()).unwrap();
        let todo_service = TodoService::new(storage);

        // 测试添加任务
        let todo = todo_service.add_todo("测试任务".to_string(), None).await.unwrap();
        assert_eq!(todo.title, "测试任务");
        assert!(!todo.completed);

        // 测试获取任务
        let todos = todo_service.get_todos().await.unwrap();
        assert_eq!(todos.len(), 1);

        // 测试更新任务
        let updated = todo_service.update_todo(todo.id.clone(), TodoUpdate {
            title: Some("更新的任务".to_string()),
            completed: Some(true),
            ..Default::default()
        }).await.unwrap();
        assert_eq!(updated.title, "更新的任务");
        assert!(updated.completed);

        // 测试删除任务
        todo_service.delete_todo(todo.id).await.unwrap();
        let todos = todo_service.get_todos().await.unwrap();
        assert_eq!(todos.len(), 0);
    }

    #[tokio::test]
    async fn test_data_persistence() {
        let temp_dir = TempDir::new().unwrap();

        // 创建数据
        {
            let storage = StorageService::new_with_path(temp_dir.path()).unwrap();
            let todo_service = TodoService::new(storage);
            todo_service.add_todo("持久化测试".to_string(), None).await.unwrap();
        }

        // 重新加载数据
        {
            let storage = StorageService::new_with_path(temp_dir.path()).unwrap();
            let todo_service = TodoService::new(storage);
            let todos = todo_service.get_todos().await.unwrap();
            assert_eq!(todos.len(), 1);
            assert_eq!(todos[0].title, "持久化测试");
        }
    }
}
```

## 构建和部署 (离线构建)

### 构建配置

```json
// tauri.conf.json
{
  "build": {
    "beforeBuildCommand": "pnpm build",
    "beforeDevCommand": "pnpm dev",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "ImageTodo",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "createDir": true,
        "removeFile": true,
        "exists": true
      },
      "window": {
        "all": false,
        "show": true,
        "hide": true,
        "setSize": true,
        "setPosition": true,
        "setAlwaysOnTop": true,
        "setDecorations": true,
        "startDragging": true
      },
      "systemTray": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "category": "Productivity",
      "copyright": "",
      "deb": {
        "depends": []
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.imagetodo.app",
      "longDescription": "一个轻量级的离线 Todo 应用",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "ImageTodo",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'"
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 400,
        "resizable": false,
        "title": "ImageTodo",
        "width": 320,
        "minWidth": 280,
        "minHeight": 200,
        "maxHeight": 800,
        "decorations": false,
        "transparent": true,
        "alwaysOnTop": false,
        "skipTaskbar": false,
        "center": true
      }
    ],
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    }
  }
}
```

### 离线构建脚本

```bash
#!/bin/bash
# scripts/build-offline.sh

echo "开始离线构建 ImageTodo..."

# 检查网络依赖
echo "检查是否包含网络依赖..."
if grep -r "fetch\|axios\|request" src/ --exclude-dir=node_modules; then
    echo "❌ 发现网络请求代码，构建失败"
    exit 1
fi

if grep -r "reqwest\|hyper\|tokio.*net" src-tauri/src/; then
    echo "❌ 发现 Rust 网络依赖，构建失败"
    exit 1
fi

echo "✅ 网络依赖检查通过"

# 构建前端
echo "构建前端..."
pnpm install --frozen-lockfile
pnpm build

# 构建 Tauri 应用
echo "构建 Tauri 应用..."
cd src-tauri
cargo build --release

# 打包应用
echo "打包应用..."
pnpm tauri build

echo "✅ 离线构建完成"
```

## 生产级测试架构设计

### 测试金字塔架构

```
┌─────────────────────────────────────────────────────────────┐
│                    生产级测试金字塔                          │
├─────────────────────────────────────────────────────────────┤
│  E2E 测试层 (10% - 关键用户流程)                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Playwright + Tauri 集成测试                            │ │
│  │  • 完整用户工作流程测试                                  │ │
│  │  • 跨平台兼容性测试                                      │ │
│  │  • 性能基准测试                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  集成测试层 (20% - 组件协作)                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React Testing Library + MSW                           │ │
│  │  • 组件与状态管理集成                                    │ │
│  │  • 数据流集成测试                                        │ │
│  │  • Tauri API 集成测试                                   │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  单元测试层 (70% - 组件和函数)                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Vitest + React Testing Library                        │ │
│  │  • React 组件单元测试                                   │ │
│  │  • 业务逻辑函数测试                                      │ │
│  │  • 工具函数测试                                          │ │
│  │  • Rust 函数单元测试                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 测试配置架构

```typescript
// vitest.config.ts - 单元测试配置
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['src/test/e2e/**']
  }
});

// playwright.config.ts - E2E 测试配置
export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:1420',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'tauri-app',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.e2e.{js,ts}'
    }
  ]
});
```

### 测试组织结构

```
src/test/
├── __mocks__/           # 模拟对象
│   ├── tauri.ts         # Tauri API 模拟
│   ├── fs.ts            # 文件系统模拟
│   └── window.ts        # 窗口 API 模拟
├── fixtures/            # 测试数据
│   ├── todos.json       # 示例任务数据
│   ├── settings.json    # 示例设置数据
│   └── users.json       # 测试用户数据
├── helpers/             # 测试辅助函数
│   ├── render.tsx       # 自定义渲染函数
│   ├── store.ts         # 测试状态管理
│   └── assertions.ts    # 自定义断言
├── unit/                # 单元测试
│   ├── components/      # 组件测试
│   ├── hooks/           # Hook 测试
│   ├── stores/          # 状态管理测试
│   └── utils/           # 工具函数测试
├── integration/         # 集成测试
│   ├── features/        # 功能集成测试
│   ├── data-flow/       # 数据流测试
│   └── api/             # API 集成测试
└── e2e/                 # 端到端测试
    ├── user-flows/      # 用户流程测试
    ├── performance/     # 性能测试
    └── accessibility/   # 无障碍测试
```

### 性能测试架构

```typescript
// 性能监控和测试
interface PerformanceMetrics {
  startupTime: number;      // 启动时间
  memoryUsage: number;      // 内存使用
  renderTime: number;       // 渲染时间
  interactionDelay: number; // 交互延迟
}

// 性能基准测试
describe('Performance Benchmarks', () => {
  test('应用启动时间 < 2秒', async () => {
    const startTime = performance.now();
    await app.launch();
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(2000);
  });

  test('内存使用 < 50MB', async () => {
    const memoryUsage = await app.getMemoryUsage();
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024);
  });

  test('任务操作响应时间 < 100ms', async () => {
    const startTime = performance.now();
    await app.addTodo('Test task');
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## 生产级错误处理架构

### 错误边界设计

```typescript
// React 错误边界
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到日志系统
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // 发送错误报告（仅在用户同意的情况下）
    if (settings.errorReporting) {
      errorReporter.captureException(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Rust 错误处理
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("文件系统错误: {0}")]
    FileSystem(#[from] std::io::Error),

    #[error("JSON 序列化错误: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("窗口操作错误: {0}")]
    Window(String),

    #[error("数据验证错误: {0}")]
    Validation(String),
}

type Result<T> = std::result::Result<T, AppError>;
```

## 总结

这个生产级设计文档完全基于离线优先的理念和 UI-First 开发策略，确保 ImageTodo 应用：

### 核心特性保证
1. **完全离线运行** - 无任何网络依赖，通过构建时检查确保
2. **数据本地化** - 所有数据存储在本地，原子性写入保证数据完整性
3. **隐私保护** - 用户数据完全私有，零数据收集
4. **架构扩展性** - 为未来云同步预留接口，不影响离线体验
5. **macOS 风格** - 原生的用户体验，遵循 Apple HIG 设计规范

### 生产级质量保证
6. **UI-First 开发** - 优先实现可视化界面，确保每个阶段都有可测试的用户界面
7. **测试覆盖** - 单元测试 ≥ 90%，集成测试覆盖核心流程，E2E 测试验证用户工作流程
8. **性能优化** - 启动时间 < 2秒，内存占用 < 50MB，操作响应 < 100ms
9. **错误恢复** - 完善的错误边界和恢复机制，用户友好的错误反馈
10. **代码质量** - TypeScript 严格模式，ESLint 零警告，自动化代码检查

### 开发体验保证
11. **自动化工具链** - 完整的 CI/CD 流水线，自动化测试和构建
12. **开发环境** - 热重载、自动格式化、实时错误检查
13. **文档完整** - API 文档、架构文档、用户指南齐全
14. **跨平台支持** - Windows、macOS、Linux 自动化构建和测试

### 架构优势
- **可测试性** - 架构设计优先考虑测试，支持各层级测试
- **可维护性** - 清晰的分层架构，组件化设计，易于维护和扩展
- **可扩展性** - 模块化设计，为未来功能扩展提供灵活基础
- **性能优化** - 从架构层面考虑性能，包括渲染优化和内存管理

该设计确保应用不仅在任何环境下都能稳定运行，更重要的是提供了生产级的开发体验和用户体验，为团队协作和长期维护奠定了坚实基础。