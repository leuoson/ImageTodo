# 屏幕区域截图功能修复 - 技术设计

## 设计概述

### 设计目标
修复现有屏幕区域截图功能的三个关键问题:
1. 通过DPI缩放因子转换解决坐标位置偏差
2. 通过调整执行顺序解决只能截取桌面的问题
3. 通过集成剪贴板库添加自动复制功能

### 设计原则
- **最小侵入性**: 尽量减少对现有代码的修改
- **向后兼容**: 保持现有API签名不变
- **优雅降级**: 剪贴板失败不影响文件保存
- **跨平台一致**: 所有平台行为一致

### 架构影响
- **前端**: 添加缩放因子获取和坐标转换逻辑
- **后端**: 修改截图执行顺序,添加剪贴板操作
- **依赖**: 新增arboard库用于剪贴板操作

## 技术方案

### 方案1: DPI缩放因子处理

#### 问题分析
```
用户界面(CSS像素) → Tauri窗口 → Rust后端(物理像素) → xcap截图
     100px              ?              200px (2.0x DPI)
```

当前流程缺少CSS像素到物理像素的转换步骤。

#### 解决方案

**前端修改** (`src/components/selection-overlay.tsx`):

```typescript
import { getCurrentWindow } from '@tauri-apps/api/window';

export function SelectionOverlay() {
  const [scaleFactor, setScaleFactor] = useState<number>(1.0);
  
  useEffect(() => {
    // 获取窗口缩放因子
    getCurrentWindow().scaleFactor().then(factor => {
      setScaleFactor(factor);
      console.log('Window scale factor:', factor);
    });
  }, []);
  
  const handleMouseUp = async (e: React.MouseEvent) => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    
    // 计算选择区域(CSS像素)
    const x = Math.min(startPos.x, e.clientX);
    const y = Math.min(startPos.y, e.clientY);
    const width = Math.abs(e.clientX - startPos.x);
    const height = Math.abs(e.clientY - startPos.y);
    
    // 转换为物理像素
    const physicalX = Math.round(x * scaleFactor);
    const physicalY = Math.round(y * scaleFactor);
    const physicalWidth = Math.round(width * scaleFactor);
    const physicalHeight = Math.round(height * scaleFactor);
    
    try {
      // 发送物理像素坐标给Rust
      const result = await invoke<string>('capture_screen_region', {
        x: physicalX,
        y: physicalY,
        width: physicalWidth,
        height: physicalHeight,
      });
      
      toast.success(result);
    } catch (error) {
      toast.error(`截图失败: ${error}`);
    }
  };
  
  // ... 其余代码保持不变
}
```

**关键点**:
- 使用`getCurrentWindow().scaleFactor()`获取缩放因子
- 在组件挂载时获取一次(缩放因子通常不变)
- 在发送坐标前乘以缩放因子
- 使用`Math.round()`确保整数坐标

**替代方案**: 在Rust端获取缩放因子并调整坐标
- 优点: 前端代码更简单
- 缺点: Rust端获取窗口缩放因子较复杂,需要额外的窗口句柄操作
- 结论: 前端方案更简单直接,推荐使用

### 方案2: 截图前隐藏覆盖层窗口

#### 问题分析
当前执行顺序:
```
1. 接收截图命令
2. 调用 monitor.capture_region() ← 覆盖层仍可见!
3. 保存文件
4. 关闭覆盖层窗口
```

问题: 步骤2时覆盖层的半透明遮罩仍在屏幕上,被xcap捕获。

#### 解决方案

**后端修改** (`src-tauri/src/lib.rs`):

```rust
#[tauri::command]
async fn capture_screen_region(
    app: tauri::AppHandle,
    x: i32,
    y: i32,
    width: i32,
    height: i32,
) -> Result<String, String> {
    use std::thread;
    use std::time::Duration;
    
    // 1. 先获取窗口引用
    let window = app
        .get_webview_window("region-selector")
        .ok_or("Failed to get selector window")?;
    
    // 2. 隐藏窗口
    window
        .hide()
        .map_err(|e| format!("Failed to hide window: {}", e))?;
    
    // 3. 等待窗口完全隐藏(关键!)
    thread::sleep(Duration::from_millis(100));
    
    // 4. 现在截图(覆盖层已不可见)
    let monitors = Monitor::all().map_err(|e| format!("Failed to get monitors: {}", e))?;
    let monitor = monitors
        .first()
        .ok_or("No monitor found")?;
    
    // 验证坐标和尺寸
    if width <= 0 || height <= 0 {
        return Err("Invalid dimensions".to_string());
    }
    
    let x_u32 = x.max(0) as u32;
    let y_u32 = y.max(0) as u32;
    let width = width as u32;
    let height = height as u32;
    
    let image = monitor
        .capture_region(x_u32, y_u32, width, height)
        .map_err(|e| format!("Failed to capture region: {}", e))?;
    
    // 5. 保存文件
    let downloads_dir = get_downloads_dir()?;
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("screenshot_{}.png", timestamp);
    let filepath = downloads_dir.join(&filename);
    
    image
        .save(&filepath)
        .map_err(|e| format!("Failed to save image: {}", e))?;
    
    // 6. 复制到剪贴板(见方案3)
    // ... clipboard code here ...
    
    // 7. 最后关闭窗口
    window
        .close()
        .map_err(|e| format!("Failed to close window: {}", e))?;
    
    Ok(format!("截图已保存: {}", filename))
}
```

**关键点**:
- 在截图前调用`window.hide()`
- 添加100ms延迟确保窗口完全隐藏
- 延迟值经过测试选择,平衡速度和可靠性
- 在所有操作完成后才关闭窗口

**平台差异考虑**:
- macOS: `hide()`通常很快,100ms足够
- Windows: 可能需要稍长延迟,但100ms应该足够
- Linux: X11下`hide()`是同步的,延迟可能不必要但无害

**可配置延迟**(未来增强):
```rust
// 可以从设置中读取延迟值
let delay_ms = app.state::<Settings>()
    .lock()
    .unwrap()
    .capture_delay_ms
    .unwrap_or(100);
thread::sleep(Duration::from_millis(delay_ms));
```

### 方案3: 剪贴板功能集成

#### 依赖选择

**arboard vs clipboard-rs vs cli-clipboard**:

| 特性 | arboard | clipboard-rs | cli-clipboard |
|------|---------|--------------|---------------|
| 图片支持 | ✅ 原生 | ✅ 原生 | ❌ 仅文本 |
| 跨平台 | ✅ Win/Mac/Linux | ✅ Win/Mac/Linux | ✅ Win/Mac/Linux |
| 维护状态 | ✅ 活跃 | ⚠️ 较少更新 | ✅ 活跃 |
| 文档质量 | ✅ 优秀 | ⚠️ 一般 | ✅ 良好 |
| 社区使用 | ✅ 广泛 | ⚠️ 较少 | ⚠️ 较少 |

**结论**: 选择arboard,最成熟且文档完善。

#### 实现方案

**添加依赖** (`src-tauri/Cargo.toml`):

```toml
[dependencies]
arboard = "3.4"  # 最新稳定版本
```

**后端实现** (在`capture_screen_region`函数中):

```rust
use arboard::{Clipboard, ImageData};
use std::borrow::Cow;

// ... 在保存文件后 ...

// 复制到剪贴板
let clipboard_result = (|| -> Result<(), String> {
    // 创建剪贴板实例
    let mut clipboard = Clipboard::new()
        .map_err(|e| format!("Failed to access clipboard: {}", e))?;
    
    // 将xcap的RgbaImage转换为arboard的ImageData
    let (width, height) = image.dimensions();
    let rgba_data = image.to_vec();
    
    let img_data = ImageData {
        width: width as usize,
        height: height as usize,
        bytes: Cow::from(rgba_data),
    };
    
    // 设置剪贴板内容
    clipboard
        .set_image(img_data)
        .map_err(|e| format!("Failed to set clipboard: {}", e))?;
    
    Ok(())
})();

// 根据剪贴板操作结果返回不同消息
let message = match clipboard_result {
    Ok(_) => format!("截图已保存并复制到剪贴板: {}", filename),
    Err(e) => {
        eprintln!("Clipboard error: {}", e);
        format!("截图已保存,但复制到剪贴板失败: {}", filename)
    }
};

// 关闭窗口
window.close().ok();

Ok(message)
```

**关键点**:
- 使用闭包和`?`操作符简化错误处理
- 剪贴板失败不影响文件保存
- 返回详细的成功/失败消息
- 使用`Cow::from()`避免不必要的数据复制

**图像格式转换**:
```
xcap::RgbaImage (image crate)
    ↓ to_vec()
Vec<u8> (RGBA bytes)
    ↓ Cow::from()
arboard::ImageData
    ↓ clipboard.set_image()
系统剪贴板
```

#### 错误处理策略

```rust
// 剪贴板操作的所有可能错误
enum ClipboardError {
    AccessDenied,      // 权限不足
    ClipboardLocked,   // 被其他应用锁定
    UnsupportedFormat, // 格式不支持(不太可能)
    Unknown(String),   // 其他错误
}

// 优雅降级
match clipboard.set_image(img_data) {
    Ok(_) => "已复制到剪贴板",
    Err(arboard::Error::ClipboardOccupied) => {
        // 剪贴板被占用,稍后重试一次
        thread::sleep(Duration::from_millis(50));
        match clipboard.set_image(img_data) {
            Ok(_) => "已复制到剪贴板",
            Err(_) => "剪贴板复制失败(被占用)",
        }
    },
    Err(e) => {
        eprintln!("Clipboard error: {:?}", e);
        "剪贴板复制失败"
    }
}
```

### 方案4: 国际化消息更新

#### i18n文件修改

**中文** (`src/lib/i18n/zh-CN.json`):

```json
{
  "screenshot": {
    "success": "截图已保存: {{filename}}",
    "successWithClipboard": "截图已保存并复制到剪贴板: {{filename}}",
    "successClipboardFailed": "截图已保存,但复制到剪贴板失败: {{filename}}",
    "error": "截图失败: {{error}}"
  }
}
```

**英文** (`src/lib/i18n/en-US.json`):

```json
{
  "screenshot": {
    "success": "Screenshot saved: {{filename}}",
    "successWithClipboard": "Screenshot saved and copied to clipboard: {{filename}}",
    "successClipboardFailed": "Screenshot saved, but failed to copy to clipboard: {{filename}}",
    "error": "Screenshot failed: {{error}}"
  }
}
```

#### 前端使用

```typescript
// 在 selection-overlay.tsx 中
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// 显示消息
toast.success(result); // result已经是翻译后的消息
```

**注意**: 由于消息是从Rust返回的,需要在Rust端进行国际化,或者返回消息键让前端翻译。

**推荐方案**: Rust返回完整的中文消息,前端直接显示。英文支持作为未来增强。

## 数据流设计

### 完整截图流程

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 用户操作                                                  │
│    - 按下快捷键                                              │
│    - 拖动选择区域                                            │
│    - 释放鼠标                                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. 前端处理 (selection-overlay.tsx)                         │
│    - 获取CSS坐标: (x, y, width, height)                     │
│    - 获取缩放因子: scaleFactor                               │
│    - 转换为物理坐标:                                         │
│      physicalX = x * scaleFactor                            │
│      physicalY = y * scaleFactor                            │
│      physicalWidth = width * scaleFactor                    │
│      physicalHeight = height * scaleFactor                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ invoke('capture_screen_region', {...})
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Rust后端处理 (lib.rs)                                    │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ 3.1 获取窗口引用                                     │ │
│    │     window = app.get_webview_window("region-selector")│ │
│    └─────────────────────────────────────────────────────┘ │
│                         │                                    │
│                         ▼                                    │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ 3.2 隐藏窗口                                         │ │
│    │     window.hide()                                    │ │
│    │     sleep(100ms)  ← 关键!                           │ │
│    └─────────────────────────────────────────────────────┘ │
│                         │                                    │
│                         ▼                                    │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ 3.3 截图                                             │ │
│    │     monitor.capture_region(x, y, width, height)      │ │
│    │     → RgbaImage                                      │ │
│    └─────────────────────────────────────────────────────┘ │
│                         │                                    │
│                         ▼                                    │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ 3.4 保存文件                                         │ │
│    │     filepath = downloads/screenshot_timestamp.png    │ │
│    │     image.save(filepath)                             │ │
│    └─────────────────────────────────────────────────────┘ │
│                         │                                    │
│                         ▼                                    │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ 3.5 复制到剪贴板                                     │ │
│    │     clipboard = Clipboard::new()                     │ │
│    │     img_data = ImageData::from(image)                │ │
│    │     clipboard.set_image(img_data)                    │ │
│    │     → Result<(), Error>                              │ │
│    └─────────────────────────────────────────────────────┘ │
│                         │                                    │
│                         ▼                                    │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ 3.6 生成消息                                         │ │
│    │     if clipboard_ok:                                 │ │
│    │         "截图已保存并复制到剪贴板"                   │ │
│    │     else:                                            │ │
│    │         "截图已保存,但复制到剪贴板失败"              │ │
│    └─────────────────────────────────────────────────────┘ │
│                         │                                    │
│                         ▼                                    │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ 3.7 关闭窗口                                         │ │
│    │     window.close()                                   │ │
│    └─────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ return message
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. 前端显示结果                                              │
│    - toast.success(message)                                 │
│    - 用户看到成功消息                                        │
│    - 用户可以Ctrl+V粘贴图片                                  │
└─────────────────────────────────────────────────────────────┘
```

### 错误处理流程

```
任何步骤失败
    │
    ▼
捕获错误
    │
    ├─ 窗口操作失败 → "Failed to hide/close window"
    ├─ 截图失败 → "Failed to capture region"
    ├─ 文件保存失败 → "Failed to save image"
    └─ 剪贴板失败 → 继续执行,返回部分成功消息
    │
    ▼
返回错误消息给前端
    │
    ▼
toast.error(message)
```

## 组件修改清单

### 前端修改

#### `src/components/selection-overlay.tsx`

**修改内容**:
1. 导入Tauri window API
2. 添加`scaleFactor`状态
3. 在`useEffect`中获取缩放因子
4. 在`handleMouseUp`中转换坐标

**修改行数**: 约20行新增/修改

**风险**: 低 - 仅添加坐标转换逻辑

### 后端修改

#### `src-tauri/src/lib.rs`

**修改内容**:
1. 导入`std::thread`和`std::time::Duration`
2. 导入`arboard`相关类型
3. 重构`capture_screen_region`函数:
   - 调整执行顺序
   - 添加窗口隐藏逻辑
   - 添加剪贴板复制逻辑
   - 改进错误处理和消息返回

**修改行数**: 约50行新增/修改

**风险**: 中 - 修改核心截图逻辑,需要充分测试

#### `src-tauri/Cargo.toml`

**修改内容**:
1. 添加`arboard = "3.4"`依赖

**修改行数**: 1行新增

**风险**: 低 - 仅添加依赖

## 测试策略

### 单元测试

**前端测试** (`src/components/__tests__/selection-overlay.test.tsx`):

```typescript
describe('SelectionOverlay - Scale Factor', () => {
  it('should get scale factor on mount', async () => {
    const mockScaleFactor = jest.fn().mockResolvedValue(2.0);
    (getCurrentWindow as jest.Mock).mockReturnValue({
      scaleFactor: mockScaleFactor,
    });
    
    render(<SelectionOverlay />);
    
    await waitFor(() => {
      expect(mockScaleFactor).toHaveBeenCalled();
    });
  });
  
  it('should convert CSS pixels to physical pixels', async () => {
    // Mock scale factor 2.0
    const mockInvoke = jest.fn();
    
    // Simulate mouse drag from (100, 100) to (200, 200)
    // Expected physical coordinates: (200, 200) to (400, 400)
    
    // ... test implementation ...
    
    expect(mockInvoke).toHaveBeenCalledWith('capture_screen_region', {
      x: 200,
      y: 200,
      width: 200,
      height: 200,
    });
  });
});
```

**后端测试** (集成测试):

由于涉及窗口操作和系统剪贴板,主要通过手动测试和集成测试验证。

### 集成测试

**测试矩阵**:

| 平台 | DPI | 测试内容 | 预期结果 |
|------|-----|----------|----------|
| macOS | 1.0x | 坐标准确性 | ✅ 匹配 |
| macOS | 2.0x | 坐标准确性 | ✅ 匹配 |
| macOS | 2.0x | 截取浏览器 | ✅ 显示内容 |
| macOS | 2.0x | 剪贴板复制 | ✅ 可粘贴 |
| Windows | 1.0x | 坐标准确性 | ✅ 匹配 |
| Windows | 1.5x | 坐标准确性 | ✅ 匹配 |
| Windows | 2.0x | 截取应用 | ✅ 显示内容 |
| Windows | 2.0x | 剪贴板复制 | ✅ 可粘贴 |
| Linux | 1.0x | 坐标准确性 | ✅ 匹配 |
| Linux | 2.0x | 截取应用 | ✅ 显示内容 |
| Linux | 2.0x | 剪贴板复制 | ✅ 可粘贴 |

### 性能测试

**测试指标**:
- 缩放因子获取时间: < 100ms
- 窗口隐藏延迟: 100ms (固定)
- 截图时间: < 500ms (取决于区域大小)
- 剪贴板复制时间: < 100ms
- 总体时间增加: < 200ms

**测试方法**:
```rust
let start = std::time::Instant::now();
// ... 执行操作 ...
let duration = start.elapsed();
println!("Operation took: {:?}", duration);
```

## 部署考虑

### 依赖更新

**Cargo.lock更新**:
- 添加arboard后需要更新Cargo.lock
- 确保所有平台上依赖解析一致

**构建验证**:
```bash
# 清理并重新构建
cargo clean
cargo build --release

# 验证所有平台
cargo build --target x86_64-apple-darwin
cargo build --target x86_64-pc-windows-msvc
cargo build --target x86_64-unknown-linux-gnu
```

### 版本更新

**package.json**:
```json
{
  "version": "1.1.0"  // 从1.0.x升级到1.1.0
}
```

**Cargo.toml**:
```toml
[package]
version = "1.1.0"
```

**CHANGELOG.md**:
```markdown
## [1.1.0] - 2025-01-XX

### Fixed
- 修复高DPI显示器上截图位置偏差问题
- 修复截图只能捕获桌面背景的问题

### Added
- 截图自动复制到系统剪贴板
- 改进的成功/失败消息提示

### Changed
- 优化截图执行流程,提高可靠性
```

## 回滚计划

### 回滚触发条件
- 关键功能失效(无法截图)
- 严重性能问题(延迟>1秒)
- 跨平台兼容性问题

### 回滚步骤
1. 恢复`src/components/selection-overlay.tsx`到修改前版本
2. 恢复`src-tauri/src/lib.rs`到修改前版本
3. 从`Cargo.toml`移除arboard依赖
4. 重新构建和测试
5. 发布回滚版本

### 数据兼容性
- 无数据库变更,无需数据迁移
- 设置文件格式不变
- 完全向后兼容

## 未来优化

### 短期优化(1-2个版本)
1. **可配置延迟**: 允许用户调整窗口隐藏延迟
2. **剪贴板优先模式**: 选项只复制到剪贴板,不保存文件
3. **性能监控**: 添加性能指标收集

### 长期优化(3+个版本)
1. **多显示器支持**: 正确处理不同显示器的不同缩放因子
2. **动态缩放因子**: 监听系统DPI变化事件
3. **剪贴板历史**: 保存最近的截图到剪贴板历史
4. **OCR集成**: 从截图中提取文本

## 附录

### 参考文档
- [Tauri Window API](https://v2.tauri.app/reference/javascript/api/namespacewebviewwindow/)
- [arboard文档](https://docs.rs/arboard/latest/arboard/)
- [xcap文档](https://docs.rs/xcap/latest/xcap/)

### 相关Issue
- 原始实现: `.spec-workflow/specs/screen-region-capture/`
- 用户反馈: 坐标偏差、只能截取桌面、需要剪贴板功能

