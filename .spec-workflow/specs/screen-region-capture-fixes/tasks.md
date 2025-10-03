# 屏幕区域截图功能修复 - 任务清单

## 任务概述

本任务清单用于修复屏幕区域截图功能的三个关键问题:
1. DPI缩放因子处理 - 解决坐标位置偏差
2. 截图前隐藏覆盖层 - 解决只能截取桌面的问题
3. 剪贴板功能集成 - 添加自动复制功能

**总任务数**: 15个
**预计工时**: 4-6小时
**优先级**: 高(修复关键缺陷)

## Phase 1: 准备工作

### [ ] Task 1.1: 添加arboard依赖
**描述**: 在Cargo.toml中添加arboard剪贴板库依赖

**验收标准**:
- [ ] `src-tauri/Cargo.toml`中添加`arboard = "3.4"`
- [ ] 运行`cargo build`成功编译
- [ ] Cargo.lock文件已更新

**_Prompt**:
```
在 src-tauri/Cargo.toml 的 [dependencies] 部分添加:
arboard = "3.4"

然后运行 cargo build 验证依赖解析成功。
```

**预计时间**: 10分钟
**依赖**: 无
**风险**: 低

---

### [ ] Task 1.2: 验证Tauri Window API可用性
**描述**: 确认前端可以访问getCurrentWindow和scaleFactor API

**验收标准**:
- [ ] 在selection-overlay.tsx中成功导入`getCurrentWindow`
- [ ] 调用`scaleFactor()`返回有效数值
- [ ] 在控制台输出缩放因子值

**_Prompt**:
```
在 src/components/selection-overlay.tsx 顶部添加导入:
import { getCurrentWindow } from '@tauri-apps/api/window';

在组件中添加测试代码:
useEffect(() => {
  getCurrentWindow().scaleFactor().then(factor => {
    console.log('Scale factor:', factor);
  });
}, []);

运行应用并检查控制台输出。
```

**预计时间**: 15分钟
**依赖**: 无
**风险**: 低

---

## Phase 2: 前端修改 - DPI缩放处理

### [ ] Task 2.1: 添加scaleFactor状态
**描述**: 在SelectionOverlay组件中添加缩放因子状态管理

**验收标准**:
- [ ] 添加`scaleFactor`状态,默认值1.0
- [ ] 状态类型为`number`
- [ ] 使用`useState`钩子

**_Prompt**:
```
在 src/components/selection-overlay.tsx 的 SelectionOverlay 组件中添加:

const [scaleFactor, setScaleFactor] = useState<number>(1.0);
```

**预计时间**: 5分钟
**依赖**: Task 1.2
**风险**: 低

---

### [ ] Task 2.2: 在组件挂载时获取缩放因子
**描述**: 使用useEffect在组件挂载时获取并存储缩放因子

**验收标准**:
- [ ] 在`useEffect`中调用`getCurrentWindow().scaleFactor()`
- [ ] 成功获取后更新`scaleFactor`状态
- [ ] 添加错误处理和日志输出
- [ ] 依赖数组为空(仅在挂载时执行一次)

**_Prompt**:
```
在 src/components/selection-overlay.tsx 中添加 useEffect:

useEffect(() => {
  getCurrentWindow()
    .scaleFactor()
    .then(factor => {
      setScaleFactor(factor);
      console.log('Window scale factor:', factor);
    })
    .catch(err => {
      console.error('Failed to get scale factor:', err);
      // 保持默认值 1.0
    });
}, []);
```

**预计时间**: 10分钟
**依赖**: Task 2.1
**风险**: 低

---

### [ ] Task 2.3: 修改handleMouseUp进行坐标转换
**描述**: 在发送截图命令前将CSS像素坐标转换为物理像素坐标

**验收标准**:
- [ ] 计算CSS像素坐标(x, y, width, height)
- [ ] 乘以`scaleFactor`转换为物理像素
- [ ] 使用`Math.round()`确保整数坐标
- [ ] 发送物理像素坐标给Rust后端
- [ ] 添加调试日志输出转换前后的坐标

**_Prompt**:
```
修改 src/components/selection-overlay.tsx 中的 handleMouseUp 函数:

const handleMouseUp = async (e: React.MouseEvent) => {
  if (!isSelecting) return;
  
  setIsSelecting(false);
  
  // 计算CSS像素坐标
  const x = Math.min(startPos.x, e.clientX);
  const y = Math.min(startPos.y, e.clientY);
  const width = Math.abs(e.clientX - startPos.x);
  const height = Math.abs(e.clientY - startPos.y);
  
  // 转换为物理像素
  const physicalX = Math.round(x * scaleFactor);
  const physicalY = Math.round(y * scaleFactor);
  const physicalWidth = Math.round(width * scaleFactor);
  const physicalHeight = Math.round(height * scaleFactor);
  
  console.log('CSS coordinates:', { x, y, width, height });
  console.log('Physical coordinates:', { 
    x: physicalX, 
    y: physicalY, 
    width: physicalWidth, 
    height: physicalHeight 
  });
  
  try {
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
```

**预计时间**: 20分钟
**依赖**: Task 2.2
**风险**: 低

---

## Phase 3: 后端修改 - 截图时序优化

### [ ] Task 3.1: 导入必要的Rust模块
**描述**: 在lib.rs中导入线程和时间相关模块

**验收标准**:
- [ ] 导入`std::thread`
- [ ] 导入`std::time::Duration`
- [ ] 代码编译无错误

**_Prompt**:
```
在 src-tauri/src/lib.rs 文件顶部添加导入:

use std::thread;
use std::time::Duration;
```

**预计时间**: 5分钟
**依赖**: Task 1.1
**风险**: 低

---

### [ ] Task 3.2: 在截图前添加窗口隐藏逻辑
**描述**: 修改capture_screen_region函数,在截图前隐藏覆盖层窗口

**验收标准**:
- [ ] 在函数开始时获取窗口引用
- [ ] 调用`window.hide()`隐藏窗口
- [ ] 添加100ms延迟等待窗口完全隐藏
- [ ] 延迟后再执行截图操作
- [ ] 添加错误处理

**_Prompt**:
```
修改 src-tauri/src/lib.rs 中的 capture_screen_region 函数,在截图前添加:

// 1. 获取窗口引用
let window = app
    .get_webview_window("region-selector")
    .ok_or("Failed to get selector window")?;

// 2. 隐藏窗口
window
    .hide()
    .map_err(|e| format!("Failed to hide window: {}", e))?;

// 3. 等待窗口完全隐藏
thread::sleep(Duration::from_millis(100));

// 4. 现在执行截图(原有的截图代码)
let monitors = Monitor::all().map_err(|e| format!("Failed to get monitors: {}", e))?;
// ... 其余截图代码 ...
```

**预计时间**: 30分钟
**依赖**: Task 3.1
**风险**: 中 - 需要仔细调整代码顺序

---

### [ ] Task 3.3: 将窗口关闭移到函数末尾
**描述**: 确保窗口关闭操作在所有其他操作完成后执行

**验收标准**:
- [ ] 窗口关闭代码移到函数最后
- [ ] 在文件保存和剪贴板操作之后
- [ ] 使用`.ok()`忽略关闭错误(窗口可能已关闭)

**_Prompt**:
```
在 src-tauri/src/lib.rs 的 capture_screen_region 函数末尾,
在返回成功消息之前添加:

// 关闭窗口
window.close().ok();

Ok(message)
```

**预计时间**: 10分钟
**依赖**: Task 3.2
**风险**: 低

---

## Phase 4: 后端修改 - 剪贴板功能

### [ ] Task 4.1: 导入arboard模块
**描述**: 在lib.rs中导入arboard相关类型

**验收标准**:
- [ ] 导入`Clipboard`类型
- [ ] 导入`ImageData`类型
- [ ] 导入`std::borrow::Cow`
- [ ] 代码编译无错误

**_Prompt**:
```
在 src-tauri/src/lib.rs 文件顶部添加导入:

use arboard::{Clipboard, ImageData};
use std::borrow::Cow;
```

**预计时间**: 5分钟
**依赖**: Task 1.1
**风险**: 低

---

### [ ] Task 4.2: 实现剪贴板复制逻辑
**描述**: 在文件保存后添加剪贴板复制功能

**验收标准**:
- [ ] 创建Clipboard实例
- [ ] 将RgbaImage转换为ImageData
- [ ] 调用`clipboard.set_image()`复制图片
- [ ] 使用闭包和Result进行错误处理
- [ ] 剪贴板失败不影响文件保存

**_Prompt**:
```
在 src-tauri/src/lib.rs 的 capture_screen_region 函数中,
在文件保存成功后添加:

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
```

**预计时间**: 25分钟
**依赖**: Task 4.1, Task 3.2
**风险**: 中 - 需要正确处理图像格式转换

---

### [ ] Task 4.3: 根据剪贴板结果生成消息
**描述**: 根据剪贴板操作成功或失败返回不同的消息

**验收标准**:
- [ ] 剪贴板成功时返回"截图已保存并复制到剪贴板"
- [ ] 剪贴板失败时返回"截图已保存,但复制到剪贴板失败"
- [ ] 剪贴板错误输出到stderr
- [ ] 消息包含文件名

**_Prompt**:
```
在 src-tauri/src/lib.rs 的 capture_screen_region 函数中,
在剪贴板操作后添加:

// 根据剪贴板操作结果返回不同消息
let message = match clipboard_result {
    Ok(_) => format!("截图已保存并复制到剪贴板: {}", filename),
    Err(e) => {
        eprintln!("Clipboard error: {}", e);
        format!("截图已保存,但复制到剪贴板失败: {}", filename)
    }
};
```

**预计时间**: 10分钟
**依赖**: Task 4.2
**风险**: 低

---

## Phase 5: 测试与验证

### [ ] Task 5.1: 标准DPI显示器测试
**描述**: 在1.0x DPI显示器上测试坐标准确性

**验收标准**:
- [ ] 选择200x200像素区域
- [ ] 截图文件尺寸为200x200像素
- [ ] 截图内容与选择框位置完全匹配
- [ ] 控制台日志显示正确的坐标转换

**_Prompt**:
```
测试步骤:
1. 在标准DPI显示器(1.0x)上运行应用
2. 按下区域截图快捷键
3. 拖动选择一个200x200像素的区域
4. 检查控制台输出的CSS和物理坐标
5. 打开保存的截图文件,验证尺寸和内容
```

**预计时间**: 20分钟
**依赖**: Task 2.3, Task 3.3
**风险**: 低

---

### [ ] Task 5.2: 高DPI显示器测试
**描述**: 在2.0x DPI显示器(Retina)上测试坐标准确性

**验收标准**:
- [ ] 选择100x100 CSS像素区域
- [ ] 截图文件尺寸为200x200物理像素
- [ ] 截图内容与选择框位置完全匹配
- [ ] 控制台日志显示scaleFactor=2.0
- [ ] 坐标转换正确(CSS * 2 = 物理)

**_Prompt**:
```
测试步骤:
1. 在高DPI显示器(2.0x Retina)上运行应用
2. 检查控制台输出的scale factor应为2.0
3. 按下区域截图快捷键
4. 拖动选择一个区域
5. 验证CSS坐标 * 2 = 物理坐标
6. 打开截图文件,验证内容准确
```

**预计时间**: 20分钟
**依赖**: Task 2.3, Task 3.3
**风险**: 低

---

### [ ] Task 5.3: 截取应用窗口内容测试
**描述**: 验证能够截取其他应用窗口的实际内容

**验收标准**:
- [ ] 打开Chrome浏览器并显示网页
- [ ] 选择浏览器地址栏区域
- [ ] 截图显示地址栏的实际内容
- [ ] 截图中没有半透明遮罩
- [ ] 截图中没有选择框边框

**_Prompt**:
```
测试步骤:
1. 打开Chrome浏览器,访问任意网页
2. 运行ImageTodo应用
3. 按下区域截图快捷键
4. 选择Chrome地址栏区域
5. 打开截图文件,验证:
   - 能看到地址栏文字
   - 没有半透明遮罩
   - 没有选择框边框
6. 重复测试其他应用(VS Code, Finder等)
```

**预计时间**: 30分钟
**依赖**: Task 3.3
**风险**: 中 - 可能需要调整延迟时间

---

### [ ] Task 5.4: 剪贴板功能测试
**描述**: 验证截图自动复制到剪贴板

**验收标准**:
- [ ] 截图成功后显示"已复制到剪贴板"消息
- [ ] 文件正常保存到下载文件夹
- [ ] 在其他应用中按Ctrl+V(或Cmd+V)能粘贴图片
- [ ] 粘贴的图片内容与文件内容一致

**_Prompt**:
```
测试步骤:
1. 完成一次区域截图
2. 验证成功消息包含"复制到剪贴板"
3. 验证文件已保存
4. 打开任意图片编辑器或聊天应用
5. 按Cmd+V(macOS)或Ctrl+V(Windows/Linux)粘贴
6. 验证粘贴的图片与保存的文件一致
```

**预计时间**: 15分钟
**依赖**: Task 4.3
**风险**: 低

---

### [ ] Task 5.5: 剪贴板失败处理测试
**描述**: 验证剪贴板失败时的优雅降级

**验收标准**:
- [ ] 模拟剪贴板被占用的情况
- [ ] 显示"复制到剪贴板失败"消息
- [ ] 文件仍然正常保存
- [ ] 应用保持稳定,不崩溃

**_Prompt**:
```
测试步骤:
1. 使用其他应用锁定剪贴板(如持续复制大文件)
2. 执行区域截图
3. 验证显示失败消息但文件已保存
4. 验证应用没有崩溃或错误
5. 检查stderr日志中的错误信息
```

**预计时间**: 15分钟
**依赖**: Task 4.3
**风险**: 低

---

## Phase 6: 文档与发布

### [ ] Task 6.1: 更新CHANGELOG
**描述**: 在CHANGELOG.md中记录本次修复

**验收标准**:
- [ ] 添加新版本号1.1.0
- [ ] 在Fixed部分列出两个修复项
- [ ] 在Added部分列出剪贴板功能
- [ ] 在Changed部分说明优化

**_Prompt**:
```
在 CHANGELOG.md 顶部添加:

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

**预计时间**: 10分钟
**依赖**: 所有测试任务完成
**风险**: 低

---

### [ ] Task 6.2: 更新版本号
**描述**: 更新package.json和Cargo.toml中的版本号

**验收标准**:
- [ ] package.json版本更新为1.1.0
- [ ] src-tauri/Cargo.toml版本更新为1.1.0
- [ ] 版本号一致

**_Prompt**:
```
1. 修改 package.json:
   "version": "1.1.0"

2. 修改 src-tauri/Cargo.toml:
   [package]
   version = "1.1.0"
```

**预计时间**: 5分钟
**依赖**: Task 6.1
**风险**: 低

---

## 任务依赖关系图

```
Phase 1: 准备工作
├─ Task 1.1: 添加arboard依赖
└─ Task 1.2: 验证Tauri Window API
    │
    ▼
Phase 2: 前端修改
├─ Task 2.1: 添加scaleFactor状态
├─ Task 2.2: 获取缩放因子
└─ Task 2.3: 坐标转换
    │
    ▼
Phase 3: 后端修改 - 时序
├─ Task 3.1: 导入模块
├─ Task 3.2: 窗口隐藏逻辑
└─ Task 3.3: 窗口关闭移到末尾
    │
    ▼
Phase 4: 后端修改 - 剪贴板
├─ Task 4.1: 导入arboard
├─ Task 4.2: 剪贴板复制
└─ Task 4.3: 消息生成
    │
    ▼
Phase 5: 测试
├─ Task 5.1: 标准DPI测试
├─ Task 5.2: 高DPI测试
├─ Task 5.3: 应用窗口测试
├─ Task 5.4: 剪贴板测试
└─ Task 5.5: 失败处理测试
    │
    ▼
Phase 6: 文档与发布
├─ Task 6.1: 更新CHANGELOG
└─ Task 6.2: 更新版本号
```

## 风险管理

### 高风险任务
- **Task 3.2**: 窗口隐藏逻辑 - 可能需要调整延迟时间
- **Task 4.2**: 剪贴板复制 - 图像格式转换可能出错
- **Task 5.3**: 应用窗口测试 - 可能需要多次调整延迟

### 缓解措施
- 在多个平台上测试不同延迟值
- 添加详细的错误日志
- 准备回滚计划

## 完成标准

所有任务的复选框都被勾选,并且:
- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档更新完成
- [ ] 在至少两个平台上验证功能

