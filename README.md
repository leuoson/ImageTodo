# ImageTodo - Tauri + React + TypeScript

一个基于Tauri的待办事项应用,支持原生屏幕区域截图功能。

## 功能特性

- ✅ 待办事项管理
- 📸 交互式屏幕区域截图(使用xcap)
- ⌨️ 全局快捷键支持
- 🌍 多语言支持(中文/英文)
- 🎨 现代化UI设计

## 截图功能

本应用使用[xcap](https://github.com/nashaofu/xcap)库实现原生屏幕区域截图功能:

### 区域截图
- **默认快捷键**: `Alt+Shift+P` (可在设置中自定义)
- **使用方法**:
  1. 按下快捷键
  2. 鼠标拖拽选择要截取的区域
  3. 释放鼠标完成截图
  4. 按Esc或右键取消
- **截图范围**: 自定义选择区域(最小50x50像素)
- **保存位置**: 系统下载文件夹
- **文件格式**: PNG
- **文件命名**: `screenshot_region_YYYYMMDD_HHMMSS.png`

### macOS权限设置

首次使用截图功能时,macOS会要求授予屏幕录制权限:

1. 打开"系统偏好设置" > "安全性与隐私" > "屏幕录制"
2. 勾选ImageTodo应用
3. 重启应用

## 系统要求

### Windows
- Windows 8.1 或更高版本

### macOS
- macOS 10.13 或更高版本
- 需要授予屏幕录制权限

### Linux
需要安装以下系统依赖:

**Ubuntu/Debian:**
```bash
sudo apt-get install pkg-config libclang-dev libxcb1-dev libxrandr-dev libdbus-1-dev libpipewire-0.3-dev libwayland-dev libegl-dev
```

**Alpine:**
```bash
sudo apk add pkgconf llvm19-dev clang19-dev libxcb-dev libxrandr-dev dbus-dev pipewire-dev wayland-dev mesa-dev
```

**Arch Linux:**
```bash
sudo pacman -S base-devel clang libxcb libxrandr dbus libpipewire
```

**注意**: Linux Wayland支持有限,建议使用X11会话。

## 开发环境设置

### 推荐IDE
- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run tauri dev
```

### 构建应用
```bash
npm run tauri build
```

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **UI库**: Shadcn/ui + Radix UI + Tailwind CSS
- **后端**: Tauri 2 + Rust
- **截图**: xcap
- **状态管理**: Tauri Store
- **快捷键**: Tauri Global Shortcut

## 许可证

MIT
