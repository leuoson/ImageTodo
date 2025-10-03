# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-01-03

### Fixed
- **修复高DPI显示器上截图位置偏差问题**
  - 前端获取窗口缩放因子(scaleFactor)
  - 将CSS像素坐标转换为物理像素坐标
  - 支持1.0x、1.25x、1.5x、2.0x、3.0x等各种DPI设置
  - 在Retina和4K显示器上截图位置现在完全准确

- **修复截图只能捕获桌面背景的问题**
  - 调整截图执行顺序:先隐藏覆盖层窗口,再进行截图
  - 添加100ms延迟确保窗口完全隐藏
  - 现在可以正确截取浏览器、IDE等应用窗口的实际内容
  - 截图中不再包含半透明遮罩和选择框

### Added
- **截图自动复制到系统剪贴板**
  - 使用arboard库实现跨平台剪贴板支持
  - 截图成功后自动复制到剪贴板,可直接粘贴使用
  - 剪贴板复制失败不影响文件保存(优雅降级)
  - 支持Windows、macOS和Linux平台

- **改进的用户反馈消息**
  - 成功时显示"截图已保存并复制到剪贴板"
  - 剪贴板失败时显示"截图已保存,但复制到剪贴板失败"
  - 消息更加清晰明确

### Changed
- 优化截图执行流程,提高可靠性和准确性
- 添加详细的调试日志,便于问题诊断

### Technical
- 新增依赖:arboard 3.4(剪贴板操作)
- 使用Tauri Window API的scaleFactor()方法
- 使用std::thread::sleep进行窗口隐藏延迟
- 图像格式转换:xcap::RgbaImage → arboard::ImageData

## [1.0.0] - 2024-12-XX

### Added
- **交互式屏幕区域截图功能**
  - 全屏覆盖层,支持鼠标拖拽选择截图区域
  - 实时显示选择框和尺寸信息
  - 支持Esc键和右键取消操作
  - 最小选择区域限制(50x50像素)
  - 截图自动保存到系统下载文件夹
  - 文件命名格式:`screenshot_region_YYYYMMDD_HHMMSS.png`

- **快捷键系统增强**
  - 区域截图快捷键可在设置中自定义
  - 快捷键配置持久化存储
  - Rust后端动态读取快捷键配置
  - 支持常用修饰键组合(Alt, Shift, Ctrl, Cmd)
  - 快捷键验证和冲突检测

- **国际化支持**
  - 区域截图相关文本的中英文翻译
  - 设置界面的国际化文本
  - 错误提示的国际化

### Changed
- 移除全屏截图功能,专注于区域截图
- 简化快捷键管理,由Rust后端统一管理
- 优化设置界面,只保留区域截图快捷键配置
- 更新README文档,添加区域截图使用说明

### Fixed
- 修复快捷键捕获组件的闭包问题
- 修复Rust后端读取配置路径错误
- 修复覆盖层窗口透明度问题
- 修复macOS全屏模式导致其他应用最小化的问题

### Technical
- 使用xcap 0.7库实现屏幕区域捕获
- 使用Tauri 2的多窗口架构
- 使用Tauri Store进行配置持久化
- 使用Tauri Global Shortcut插件管理全局快捷键
- Vite多入口点配置支持覆盖层页面

## [0.1.0] - 2024-XX-XX

### Added
- 初始版本
- 待办事项管理功能
- 多语言支持(中文/英文)
- 现代化UI设计

