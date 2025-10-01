# Tauri Todo App

这是一个使用 Tauri 2 构建的跨平台桌面 Todo 应用，前端代码完全复刻自 `desktop-todo-app` 项目。

## 项目结构

本项目的文件结构与 `desktop-todo-app` 保持一致，方便您直接替换文件：

```
tauri-todo-app/
├── app/                    # 应用页面（对应 Next.js 的 app 目录）
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件库
│   ├── theme-provider.tsx # 主题提供者
│   └── todo-window.tsx   # Todo 窗口组件
├── lib/                   # 工具库
│   ├── i18n.ts           # 国际化
│   ├── types.ts          # 类型定义
│   └── utils.ts          # 工具函数
├── hooks/                 # React Hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
├── styles/                # 额外样式文件
│   └── globals.css
├── public/                # 静态资源
├── src/                   # Tauri 入口
│   └── main.tsx          # 应用入口
└── src-tauri/            # Rust 后端
    ├── src/
    │   └── lib.rs        # Tauri 配置
    └── tauri.conf.json   # Tauri 配置文件
```

## 如何更新代码

当 `desktop-todo-app` 有更新时，您可以直接复制对应的文件：

### 1. 更新组件
```bash
# 复制单个组件
cp ../desktop-todo-app/components/todo-window.tsx ./components/

# 复制所有 UI 组件
cp -r ../desktop-todo-app/components/ui/* ./components/ui/
```

### 2. 更新样式
```bash
# 复制全局样式
cp ../desktop-todo-app/app/globals.css ./app/
cp ../desktop-todo-app/styles/globals.css ./styles/
```

### 3. 更新工具库
```bash
# 复制所有 lib 文件
cp ../desktop-todo-app/lib/* ./lib/
```

### 4. 更新 Hooks
```bash
# 复制所有 hooks
cp ../desktop-todo-app/hooks/* ./hooks/
```

### 5. 更新页面
```bash
# 复制页面文件
cp ../desktop-todo-app/app/page.tsx ./app/
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建生产版本
npm run tauri build
```

## 主要差异

虽然文件结构相同，但有以下几个关键差异：

1. **字体加载**: 使用 `@fontsource/geist-sans` 和 `@fontsource/geist-mono` 替代 Next.js 的 `geist/font`
2. **主题提供者**: 使用自定义的 `theme-provider.tsx` 替代 `next-themes`
3. **数据持久化**: `todo-window.tsx` 中添加了 Tauri Store 支持
4. **布局文件**: `app/layout.tsx` 移除了 Next.js 特定的 Metadata 和 Analytics

## 技术栈

- **Tauri 2**: 桌面应用框架
- **React 19**: 前端框架
- **TypeScript**: 类型安全
- **Tailwind CSS 4**: 样式框架
- **shadcn/ui**: UI 组件库
- **Framer Motion**: 动画库
- **Tauri Store**: 数据持久化

## 特性

- ✅ 完全复刻 desktop-todo-app 的 UI 和功能
- ✅ 跨平台支持（macOS, Windows, Linux）
- ✅ 数据持久化
- ✅ 主题切换（亮色/暗色/系统）
- ✅ 国际化支持（中文/英文）
- ✅ 流畅的动画效果
- ✅ 响应式设计

## 注意事项

1. 从 `desktop-todo-app` 复制文件时，需要移除 `"use client"` 指令（如果不需要）
2. 如果组件使用了 Next.js 特定的功能（如 `next/image`, `next/link`），需要替换为标准的 React 组件
3. `todo-window.tsx` 包含了 Tauri Store 的集成代码，更新时请保留这部分

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
