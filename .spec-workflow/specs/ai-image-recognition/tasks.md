# AI图像识别待办事项 - 任务列表 (v3.0 - OCR优先架构)

## 📋 版本更新说明

**v3.0 (2025-01-03) - OCR优先架构**:
- ✅ 核心功能: 本地OCR(Tesseract/leptess)
- ✅ 可选功能: AI智能总结
- ✅ 完全离线,隐私优先
- ✅ 零成本基础功能

## 任务执行原则

### 增量开发策略
- ✅ 每个阶段独立可测试
- ✅ OCR优先,AI可选
- ✅ 每个任务完成后立即测试
- ✅ 支持快速迭代和调整

### 任务状态标记
- `[ ]` - 未开始
- `[-]` - 进行中
- `[x]` - 已完成

---

## 阶段1: 基础设施搭建 (可独立测试)

**目标**: 建立数据模型和类型定义,为后续开发打基础
**测试点**: 类型检查通过,无编译错误
**预计时间**: 30分钟
**状态**: ✅ 已完成

### [x] 任务1.1: 扩展Todo数据模型

**文件**: `src/lib/types.ts`

**目标**: 为Todo接口添加图像相关字段

**实现步骤**:
1. 打开 `src/lib/types.ts`
2. 在Todo接口中添加以下可选字段:
   - `hasImage?: boolean` - 是否包含图像
   - `imagePath?: string` - 图像文件路径
   - `imageProcessingMethod?: 'ocr' | 'ocr+ai'` - 处理方式(ocr=仅OCR, ocr+ai=OCR+AI总结)
   - `originalOcrText?: string` - OCR提取的原始文本
   - `aiSummary?: string` - AI生成的摘要(如果使用)

**验收标准**:
- ✅ TypeScript编译无错误
- ✅ 现有代码不受影响
- ✅ 新字段都是可选的

**测试方法**:
```bash
npm run type-check
```

**_Prompt**:
```
扩展src/lib/types.ts中的Todo接口,添加图像相关的可选字段:
- hasImage?: boolean
- imagePath?: string  
- imageProcessingMethod?: 'ocr' | 'ai'
- originalImageText?: string

确保所有字段都是可选的,不影响现有功能。
```

---

### [x] 任务1.2: 扩展设置数据模型

**文件**: `src/lib/settings.ts` (如果不存在则创建)

**目标**: 添加AI提供商配置

**实现步骤**:
1. 在AppSettings接口中添加AI相关配置
2. 更新defaultSettings默认值
3. 定义OpenRouter模型列表常量

**新增字段**:
```typescript
// OpenAI
openaiApiKey?: string

// OpenRouter
openrouterApiKey?: string
openrouterModel?: string

// Ollama
useOllama?: boolean
ollamaModel?: string

// 处理模式
imageProcessingMode?: 'ocr' | 'ai' | 'auto'
```

**验收标准**:
- ✅ TypeScript编译无错误
- ✅ 默认值合理
- ✅ 导出OPENROUTER_MODELS常量

**测试方法**:
```bash
npm run type-check
```

**_Prompt**:
```
在src/lib/settings.ts中扩展AppSettings接口,添加AI提供商配置字段。
参考design.md中的"3.2 设置接口扩展"部分。
同时导出OPENROUTER_MODELS常量数组,包含常用的视觉模型。
```

---

### [x] 任务1.3: 添加国际化文本

**文件**: `src/lib/i18n.ts`

**目标**: 添加所有新功能的中英文翻译

**实现步骤**:
1. 在translations对象的"zh-CN"中添加中文翻译
2. 在translations对象的"en"中添加英文翻译
3. 包含图像处理、设置、错误提示等所有文本

**新增翻译键** (参考design.md第4节):
- 图像处理相关: readingClipboard, savingImage, analyzingImage等
- 设置相关: aiProviders, openaiApiKey, openrouterApiKey等
- 错误提示: imageProcessingFailed, noImageInClipboard等

**验收标准**:
- ✅ 中英文翻译完整对应
- ✅ 无拼写错误
- ✅ 语义准确

**测试方法**:
```bash
npm run type-check
# 手动检查翻译完整性
```

**_Prompt**:
```
在src/lib/i18n.ts的translations对象中添加新的翻译键值对。
参考design.md中的"4. 国际化文本"部分,确保中英文完整对应。
```

---

**阶段1测试检查点**:
```bash
# 运行类型检查
npm run type-check

# 确认:
# ✅ 无TypeScript错误
# ✅ 所有新类型定义正确
# ✅ 国际化文本完整
```

---

## 阶段2: Rust后端 - 剪贴板和图像存储 (可独立测试)

**目标**: 实现图像读取和保存功能,不涉及AI
**测试点**: 可以从剪贴板读取图像并保存到本地
**预计时间**: 1小时
**状态**: ✅ 已完成

### [x] 任务2.1: 添加Rust依赖

**文件**: `src-tauri/Cargo.toml`

**目标**: 添加必要的Rust依赖

**实现步骤**:
1. 在[dependencies]部分添加:
   - `base64 = "0.21"` - Base64编码
   - `reqwest = { version = "0.11", features = ["json"] }` - HTTP客户端
   - `tokio = { version = "1", features = ["full"] }` - 异步运行时

**验收标准**:
- ✅ 依赖添加正确
- ✅ cargo build成功

**测试方法**:
```bash
cd src-tauri
cargo build
```

**_Prompt**:
```
在src-tauri/Cargo.toml的[dependencies]部分添加以下依赖:
- base64 = "0.21"
- reqwest = { version = "0.11", features = ["json"] }
- tokio = { version = "1", features = ["full"] }

确保版本号正确,features配置完整。
```

---

### [x] 任务2.2: 实现剪贴板图像读取命令

**文件**: `src-tauri/src/lib.rs`

**目标**: 创建read_clipboard_image命令

**实现步骤**:
1. 定义ImageData结构体
2. 实现read_clipboard_image函数
3. 在invoke_handler中注册命令

**代码参考**: design.md "2.2 剪贴板图像读取"

**验收标准**:
- ✅ 编译通过
- ✅ 命令正确注册
- ✅ 错误处理完善

**测试方法**:
```bash
cd src-tauri
cargo build
# 后续在前端调用测试
```

**_Prompt**:
```
在src-tauri/src/lib.rs中实现read_clipboard_image命令。
参考design.md中的"2.2 剪贴板图像读取"部分。

步骤:
1. 定义ImageData结构体(width, height, bytes)
2. 使用arboard::Clipboard读取图像
3. 返回Result<ImageData, String>
4. 在generate_handler!中注册命令
```

---

### [x] 任务2.3: 实现图像保存命令

**文件**: `src-tauri/src/lib.rs`

**目标**: 创建save_image命令

**实现步骤**:
1. 实现save_image函数
2. 使用app.path().app_data_dir()获取数据目录
3. 创建images子目录
4. 保存图像为PNG格式
5. 返回文件路径

**代码参考**: design.md "2.3 图像保存"

**验收标准**:
- ✅ 编译通过
- ✅ 图像正确保存
- ✅ 路径验证安全

**测试方法**:
```bash
cd src-tauri
cargo build
```

**_Prompt**:
```
在src-tauri/src/lib.rs中实现save_image命令。
参考design.md中的"2.3 图像保存"部分。

要求:
1. 接收image_data(Vec<u8>), width, height, todo_id参数
2. 保存到{app_data}/images/目录
3. 文件名格式: {todo_id}_{timestamp}.png
4. 返回完整文件路径
5. 在generate_handler!中注册命令
```

---

### [x] 任务2.4: 前端测试 - 剪贴板读取和保存

**文件**: 创建临时测试文件 `src/test-clipboard.tsx`

**目标**: 验证剪贴板读取和图像保存功能

**实现步骤**:
1. 创建简单的测试组件
2. 添加"测试剪贴板"按钮
3. 调用read_clipboard_image
4. 调用save_image保存
5. 显示结果

**测试代码**:
```typescript
import { invoke } from '@tauri-apps/api/core'
import { Button } from '@/components/ui/button'

export function ClipboardTest() {
  const testClipboard = async () => {
    try {
      const imageData = await invoke('read_clipboard_image')
      console.log('图像数据:', imageData)
      
      const todoId = Date.now().toString()
      const path = await invoke('save_image', {
        imageData: imageData.bytes,
        width: imageData.width,
        height: imageData.height,
        todoId
      })
      
      alert(`成功! 图像已保存到: ${path}`)
    } catch (error) {
      alert(`失败: ${error}`)
    }
  }
  
  return <Button onClick={testClipboard}>测试剪贴板</Button>
}
```

**验收标准**:
- ✅ 可以读取剪贴板中的图像
- ✅ 图像成功保存到本地
- ✅ 返回正确的文件路径

**测试方法**:
1. 截图并复制到剪贴板
2. 点击测试按钮
3. 检查{app_data}/images/目录

**_Prompt**:
```
创建src/test-clipboard.tsx测试组件,用于测试剪贴板读取和图像保存功能。
包含一个按钮,点击后:
1. 调用read_clipboard_image读取剪贴板
2. 调用save_image保存图像
3. 显示结果或错误

这是临时测试文件,验证通过后可删除。
```

---

**阶段2测试检查点**:
```bash
# 1. 编译Rust代码
cd src-tauri && cargo build

# 2. 运行应用
npm run tauri dev

# 3. 手动测试:
# - 截图并复制到剪贴板
# - 点击测试按钮
# - 验证图像保存成功
# - 检查文件路径正确

# 确认:
# ✅ 剪贴板读取正常
# ✅ 图像保存成功
# ✅ 文件路径正确
```

---

## 阶段3: OCR服务层 - 核心功能 ⭐ (可独立测试)

**目标**: 实现本地OCR文本识别功能
**测试点**: 可以从图像中提取文本
**预计时间**: 2小时
**状态**: ✅ 已完成

### [x] 任务3.1: 安装Tesseract OCR引擎

**系统依赖**: Tesseract OCR + 语言包

**目标**: 在开发机器上安装Tesseract

**实现步骤**:

**macOS**:
```bash
brew install tesseract tesseract-lang
```

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-eng
```

**Windows**:
1. 下载安装程序: https://github.com/UB-Mannheim/tesseract/wiki
2. 安装时选择中文和英文语言包
3. 添加到PATH环境变量

**验收标准**:
- ✅ Tesseract已安装
- ✅ 中英文语言包已安装
- ✅ 命令行可用

**测试方法**:
```bash
# 检查Tesseract版本
tesseract --version

# 检查语言包
tesseract --list-langs
# 应该看到: chi_sim, eng
```

**_Prompt**:
```
根据你的操作系统,安装Tesseract OCR引擎和中英文语言包。

macOS: brew install tesseract tesseract-lang
Ubuntu: sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-eng
Windows: 下载安装程序并选择语言包

安装后运行 tesseract --version 和 tesseract --list-langs 验证。
```

---

### [x] 任务3.2: 添加leptess依赖

**文件**: `src-tauri/Cargo.toml`

**目标**: 添加Tesseract Rust绑定

**实现步骤**:
1. 在[dependencies]部分添加:
   ```toml
   leptess = "0.14"
   ```

**验收标准**:
- ✅ 依赖添加正确
- ✅ cargo build成功

**测试方法**:
```bash
cd src-tauri
cargo build
```

**_Prompt**:
```
在src-tauri/Cargo.toml的[dependencies]部分添加:
leptess = "0.14"

然后运行 cargo build 验证编译通过。
```

---

### [x] 任务3.3: 创建OCR服务模块

**文件**: `src-tauri/src/ocr_service.rs` (新建)

**目标**: 创建OCR服务基础结构

**实现步骤**:
1. 创建新文件 `src-tauri/src/ocr_service.rs`
2. 定义OcrResult结构体
3. 定义OcrService结构体
4. 实现OCR识别功能

**代码参考**: design.md "2.4 OCR服务模块"

**验收标准**:
- ✅ 模块编译通过
- ✅ 数据结构完整
- ✅ Tesseract初始化成功

**测试方法**:
```bash
cd src-tauri
cargo build
```

**_Prompt**:
```
创建src-tauri/src/ocr_service.rs文件,实现OCR服务。
参考design.md中的"2.4 OCR服务模块"部分。

包含:
1. OcrResult结构体(text, confidence, language)
2. OcrService结构体(包含LepTess实例)
3. new()方法: 初始化Tesseract,语言设置为"chi_sim+eng"
4. recognize_from_file()方法: 从图像文件识别文本
5. 必要的use语句和derive宏

确保错误处理完善,提供友好的错误消息。
```

---

### [x] 任务3.4: 在lib.rs中注册OCR模块和命令

**文件**: `src-tauri/src/lib.rs`

**目标**: 注册OCR模块和process_image_ocr命令

**实现步骤**:
1. 在文件顶部添加 `mod ocr_service;`
2. 在generate_handler!中添加process_image_ocr
3. 确保编译通过

**验收标准**:
- ✅ 模块正确导入
- ✅ 命令正确注册
- ✅ 编译通过

**测试方法**:
```bash
cd src-tauri
cargo build
```

**_Prompt**:
```
在src-tauri/src/lib.rs中:
1. 在文件顶部添加: mod ocr_service;
2. 在tauri::generate_handler!宏中添加: ocr_service::process_image_ocr
3. 运行cargo build验证编译通过
```

---

### [x] 任务3.5: 前端测试 - OCR图像处理

**文件**: 更新 `src/test-phase.tsx`

**目标**: 测试完整的OCR处理流程

**实现步骤**:
1. 更新测试组件为阶段3测试
2. 测试完整流程: 读取→保存→OCR处理
3. 显示OCR结果(文本+置信度)

**测试代码**:
```typescript
const testOcrFlow = async () => {
  try {
    setResult('开始测试...')

    // 1. 读取剪贴板
    setResult(prev => prev + '\n正在读取剪贴板...')
    const imageData = await invoke('read_clipboard_image')

    // 2. 保存图像
    setResult(prev => prev + '\n正在保存图像...')
    const todoId = Date.now().toString()
    const imagePath = await invoke('save_image', {
      imageData: imageData.bytes,
      width: imageData.width,
      height: imageData.height,
      todoId
    })

    // 3. OCR处理
    setResult(prev => prev + '\n正在OCR识别...')
    const ocrResult = await invoke('process_image_ocr', {
      imagePath
    })

    setResult(prev => prev + `\n\n✅ OCR成功!\n文本: ${ocrResult.text}\n置信度: ${ocrResult.confidence}%\n语言: ${ocrResult.language}`)
  } catch (error) {
    setResult(prev => prev + `\n\n❌ 失败: ${error}`)
  }
}
```

**验收标准**:
- ✅ 完整流程执行成功
- ✅ 返回OCR文本
- ✅ 返回置信度
- ✅ 错误提示清晰

**测试方法**:
1. 截图包含文字的内容(网页、文档等)
2. 复制到剪贴板
3. 点击测试按钮
4. 验证OCR识别结果

**_Prompt**:
```
更新src/test-phase.tsx为阶段3测试,测试OCR处理流程。
包含:
1. 测试按钮
2. 完整流程: 读取剪贴板 → 保存图像 → OCR识别
3. 显示OCR结果(文本、置信度、语言)
4. 错误处理

这是临时测试文件,用于验证OCR功能。
```

---

**阶段3测试检查点**:
```bash
# 1. 确认Tesseract已安装
tesseract --version
tesseract --list-langs  # 应该看到 chi_sim, eng

# 2. 编译Rust代码
cd src-tauri && cargo build

# 3. 运行应用
npm run tauri dev

# 4. 手动测试:
# - 截图包含中英文文字的内容(网页、文档等)
# - 复制到剪贴板
# - 点击测试按钮
# - 验证OCR识别结果

# 确认:
# ✅ Tesseract初始化成功
# ✅ OCR识别出文本
# ✅ 置信度合理(>60%)
# ✅ 中英文都能识别
# ✅ 错误处理正常
```

---

## 阶段4: AI多提供商支持 (可独立测试)

**目标**: 实现AI多提供商加载和智能故障转移
**测试点**: 可以从设置加载多个AI提供商,自动故障转移
**预计时间**: 1.5小时

### [x] 任务4.1: 实现多提供商加载逻辑

**文件**: `src-tauri/src/lib.rs`

**目标**: 实现load_ai_providers函数

**实现步骤**:
1. 实现load_ai_providers函数
2. 从设置读取所有提供商配置
3. 创建AIProvider实例列表
4. 按优先级排序

**代码参考**: design.md "2.5 主处理命令"

**验收标准**:
- ✅ 编译通过
- ✅ 支持OpenAI、OpenRouter、Ollama
- ✅ 正确读取设置

**_Prompt**:
```
在src-tauri/src/lib.rs中实现load_ai_providers函数。
参考design.md中的"2.5 主处理命令 - 多提供商支持"部分。

从settings.json读取:
- openaiApiKey → AIProvider::openai
- openrouterApiKey + openrouterModel → AIProvider::openrouter
- useOllama + ollamaModel → AIProvider::ollama

返回Vec<AIProvider>。
```

---

### [x] 任务4.2: 实现智能提供商选择

**文件**: `src-tauri/src/ai_service.rs`

**目标**: 实现process_with_best_provider函数

**实现步骤**:
1. 实现process_with_best_provider函数
2. 遍历所有启用的提供商
3. 依次尝试,成功则返回
4. 失败则尝试下一个
5. 记录错误日志

**代码参考**: design.md "2.4 AI图像处理"

**验收标准**:
- ✅ 编译通过
- ✅ 故障转移逻辑正确
- ✅ 错误日志清晰

**_Prompt**:
```
在src-tauri/src/ai_service.rs中实现process_with_best_provider函数。
参考design.md中的实现。

逻辑:
1. 遍历providers列表
2. 对每个启用的提供商调用process_with_ai_provider
3. 成功则立即返回结果
4. 失败则记录错误,继续下一个
5. 全部失败则返回最后的错误
```

---

### [x] 任务4.3: 创建多提供商AI总结命令

**文件**: `src-tauri/src/lib.rs`

**目标**: 更新process_image_ai使用多提供商

**实现步骤**:
1. 调用load_ai_providers加载所有提供商
2. 调用process_with_best_provider处理
3. 更新ImageProcessingResult包含provider和model信息
4. 处理空提供商列表的情况

**代码参考**: design.md "2.5 主处理命令"

**验收标准**:
- ✅ 编译通过
- ✅ 支持多提供商
- ✅ 返回使用的提供商信息

**_Prompt**:
```
更新src-tauri/src/lib.rs中的process_image_ai命令。
参考design.md中的完整实现。

改为:
1. 调用load_ai_providers()获取提供商列表
2. 如果列表为空,直接返回错误
3. 调用process_with_best_provider处理
4. 在ImageProcessingResult中包含provider和model字段
```

---

### [x] 任务4.4: 实现获取可用提供商命令

**文件**: `src-tauri/src/lib.rs`

**目标**: 创建get_available_providers命令

**实现步骤**:
1. 实现get_available_providers函数
2. 调用load_ai_providers
3. 返回提供商名称列表
4. 注册命令

**代码参考**: design.md "2.5 主处理命令"

**验收标准**:
- ✅ 编译通过
- ✅ 返回正确的提供商列表
- ✅ 命令正确注册

**_Prompt**:
```
在src-tauri/src/lib.rs中实现get_available_providers命令。
参考design.md中的实现。

返回格式: Vec<String>
例如: ["openai (gpt-4.1)", "openrouter (claude-3.5-sonnet)"]

在generate_handler!中注册命令。
```

---

### [x] 任务4.5: 前端测试 - 多提供商

**文件**: 更新 `src/test-phase.tsx`

**目标**: 测试多提供商配置和故障转移

**实现步骤**:
1. 添加多个API密钥输入框
2. 添加"查看可用提供商"按钮
3. 测试故障转移(故意输入错误密钥)
4. 显示使用的提供商

**验收标准**:
- ✅ 可以配置多个提供商
- ✅ 故障转移正常工作
- ✅ 显示实际使用的提供商

**测试方法**:
1. 配置OpenAI密钥(可以是错误的)
2. 配置OpenRouter密钥(正确的)
3. 测试处理
4. 验证使用了OpenRouter

**_Prompt**:
```
更新src/test-clipboard.tsx,添加多提供商测试。
包含:
1. OpenAI、OpenRouter、Ollama的配置输入
2. "查看可用提供商"按钮
3. 显示实际使用的提供商和模型
4. 测试故障转移功能
```

---

**阶段4测试检查点**:
```bash
# 1. 编译
cd src-tauri && cargo build

# 2. 运行应用
npm run tauri dev

# 3. 测试场景:
# 场景A: 单提供商
# - 只配置OpenAI
# - 验证使用OpenAI

# 场景B: 故障转移
# - 配置错误的OpenAI密钥
# - 配置正确的OpenRouter密钥
# - 验证自动切换到OpenRouter

# 场景C: 本地Ollama(如果已安装)
# - 启用Ollama
# - 验证使用本地模型

# 确认:
# ✅ 多提供商配置正常
# ✅ 故障转移工作正常
# ✅ 返回正确的提供商信息
```

---

## 阶段5: UI集成 - 图像粘贴功能 (可独立测试)

**目标**: 在TodoWindow中集成图像粘贴功能
**测试点**: 可以在待办事项输入框粘贴图像并创建待办
**预计时间**: 1.5小时

### [x] 任务5.1: 扩展TodoWindow状态

**文件**: `src/components/todo-window.tsx`

**目标**: 添加图像处理相关状态

**实现步骤**:
1. 添加isProcessingImage状态
2. 添加imageProcessingProgress状态
3. 添加selectedImageTodo状态
4. 添加isImageDialogOpen状态

**验收标准**:
- ✅ TypeScript编译无错误
- ✅ 状态定义正确

**_Prompt**:
```
在src/components/todo-window.tsx中添加新的状态:
const [isProcessingImage, setIsProcessingImage] = useState(false)
const [imageProcessingProgress, setImageProcessingProgress] = useState<string>('')
const [selectedImageTodo, setSelectedImageTodo] = useState<Todo | null>(null)
const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
```

---

### [x] 任务5.2: 实现图像粘贴处理函数

**文件**: `src/components/todo-window.tsx`

**目标**: 实现handlePaste和handleImagePaste函数

**实现步骤**:
1. 实现handlePaste检测图像粘贴
2. 实现handleImagePaste处理图像
3. 调用后端命令: read_clipboard_image, save_image, process_image_ai
4. 创建新的Todo
5. 显示进度和错误

**代码参考**: design.md "1.1 TodoWindow组件扩展"

**验收标准**:
- ✅ 编译通过
- ✅ 可以检测图像粘贴
- ✅ 完整流程正确
- ✅ 错误处理完善

**_Prompt**:
```
在src/components/todo-window.tsx中实现handlePaste和handleImagePaste函数。
参考design.md中的"1.1 TodoWindow组件扩展"部分。

handlePaste:
- 检测clipboardData中是否有图像
- 如果有,调用handleImagePaste

handleImagePaste:
- 显示加载状态
- 调用read_clipboard_image
- 调用save_image
- 调用process_image_ai
- 创建Todo(包含图像元数据)
- 错误处理和toast提示
```

---

### [x] 任务5.3: 绑定粘贴事件到输入框

**文件**: `src/components/todo-window.tsx`

**目标**: 在输入框上绑定onPaste事件

**实现步骤**:
1. 找到新建待办事项的输入框
2. 添加onPaste={handlePaste}属性
3. 添加加载状态显示

**验收标准**:
- ✅ 粘贴事件正确绑定
- ✅ 加载状态显示

**_Prompt**:
```
在src/components/todo-window.tsx中,找到新建待办事项的输入框(Input组件)。
添加onPaste={handlePaste}属性。

在输入框下方添加加载状态显示:
{isProcessingImage && (
  <div className="text-sm text-muted-foreground">
    {imageProcessingProgress}
  </div>
)}
```

---

### [x] 任务5.4: 添加图像指示器图标

**文件**: `src/components/todo-window.tsx`

**目标**: 在有图像的待办事项旁显示图标

**实现步骤**:
1. 导入Image图标(from lucide-react)
2. 在渲染待办事项时检查hasImage
3. 显示图标

**验收标准**:
- ✅ 图标正确显示
- ✅ 样式美观

**_Prompt**:
```
在src/components/todo-window.tsx中:
1. 从lucide-react导入Image图标
2. 在渲染待办事项列表时,如果todo.hasImage为true,显示Image图标
3. 图标应该在待办事项文本旁边,使用合适的样式

示例:
{todo.hasImage && (
  <Image className="h-4 w-4 text-muted-foreground ml-2" />
)}
```

---

### [x] 任务5.5: 实现点击查看图像

**文件**: `src/components/todo-window.tsx`

**目标**: 点击有图像的待办事项时打开查看对话框

**实现步骤**:
1. 实现handleTodoClick函数
2. 在待办事项上添加onClick事件
3. 设置selectedImageTodo和isImageDialogOpen

**代码参考**: design.md "1.1 TodoWindow组件扩展"

**验收标准**:
- ✅ 点击事件正确绑定
- ✅ 状态正确更新

**_Prompt**:
```
在src/components/todo-window.tsx中:
1. 实现handleTodoClick函数(参考design.md)
2. 在待办事项的容器div上添加onClick={()=> handleTodoClick(todo)}
3. 如果todo.hasImage,添加cursor-pointer样式
```

---

**阶段5测试检查点**:
```bash
# 1. 运行应用
npm run tauri dev

# 2. 测试图像粘贴:
# - 截图包含文字的内容
# - 复制到剪贴板
# - 在待办事项输入框中按Ctrl+V(或Cmd+V)
# - 观察加载进度
# - 验证创建的待办事项

# 3. 验证:
# ✅ 粘贴事件触发
# ✅ 显示加载进度
# ✅ 创建待办事项成功
# ✅ 待办事项显示图像图标
# ✅ 待办事项文本是AI摘要

# 4. 删除测试文件:
rm src/test-clipboard.tsx
```

---

## 阶段6: 图像查看对话框 (可独立测试)

**目标**: 实现图像查看弹窗
**测试点**: 点击有图像的待办事项可以查看原图
**预计时间**: 1小时

### [x] 任务6.1: 创建ImageViewDialog组件

**文件**: `src/components/image-view-dialog.tsx` (新建)

**目标**: 创建图像查看对话框组件

**实现步骤**:
1. 创建新文件
2. 实现ImageViewDialog组件
3. 使用Radix UI Dialog
4. 实现图像缩放功能
5. 显示元数据

**代码参考**: design.md "1.2 ImageViewDialog组件"

**验收标准**:
- ✅ 编译通过
- ✅ 对话框正常显示
- ✅ 缩放功能正常
- ✅ 元数据显示完整

**_Prompt**:
```
创建src/components/image-view-dialog.tsx文件。
参考design.md中的"1.2 ImageViewDialog组件"部分。

要求:
1. 使用@radix-ui/react-dialog
2. 接收props: open, onOpenChange, todo, locale
3. 使用convertFileSrc转换图像路径
4. 实现缩放功能(zoom状态)
5. 显示待办事项文本、处理方式、提取的文本
6. 使用lucide-react的ZoomIn, ZoomOut, X图标
```

---

### [x] 任务6.2: 在TodoWindow中集成对话框

**文件**: `src/components/todo-window.tsx`

**目标**: 导入并使用ImageViewDialog

**实现步骤**:
1. 导入ImageViewDialog组件
2. 在JSX中添加ImageViewDialog
3. 传递正确的props

**验收标准**:
- ✅ 编译通过
- ✅ 对话框正确显示

**_Prompt**:
```
在src/components/todo-window.tsx中:
1. 导入ImageViewDialog组件
2. 在组件JSX的末尾添加:
<ImageViewDialog
  open={isImageDialogOpen}
  onOpenChange={setIsImageDialogOpen}
  todo={selectedImageTodo}
  locale={locale}
/>
```

---

**阶段6测试检查点**:
```bash
# 1. 运行应用
npm run tauri dev

# 2. 测试图像查看:
# - 粘贴图像创建待办事项
# - 点击该待办事项
# - 验证对话框打开
# - 测试缩放功能
# - 查看元数据

# 确认:
# ✅ 对话框正常打开
# ✅ 图像正确显示
# ✅ 缩放功能正常
# ✅ 元数据显示完整
# ✅ 关闭按钮正常
```

---

## 阶段7: 设置界面 (可独立测试)

**目标**: 添加AI提供商配置界面
**测试点**: 可以在设置中配置API密钥和提供商
**预计时间**: 1.5小时

### [x] 任务7.1: 创建AI提供商设置组件

**文件**: `src/components/ai-provider-settings.tsx` (新建)

**目标**: 创建AI提供商配置组件

**实现步骤**:
1. 创建新文件
2. 实现AIProviderSettings组件
3. 添加OpenAI、OpenRouter、Ollama配置
4. 实现测试连接功能
5. 添加处理模式选择

**代码参考**: design.md "7. 设置界面扩展"

**验收标准**:
- ✅ 编译通过
- ✅ 所有配置项完整
- ✅ 测试连接功能正常

**_Prompt**:
```
创建src/components/ai-provider-settings.tsx文件。
参考design.md中的"7. 设置界面扩展"部分。

包含:
1. OpenAI API密钥输入和测试按钮
2. OpenRouter API密钥输入和模型选择
3. Ollama开关和模型选择
4. 图像处理模式选择
5. 使用useTranslation获取翻译
6. 调用get_available_providers测试连接
```

---

### [x] 任务7.2: 集成到设置弹窗

**文件**: `src/components/settings-popup.tsx`

**目标**: 在设置弹窗中添加AI配置标签页

**实现步骤**:
1. 导入AIProviderSettings组件
2. 添加新的标签页或区域
3. 传递settings和onSettingsChange

**验收标准**:
- ✅ 编译通过
- ✅ 设置正确保存
- ✅ UI布局美观

**_Prompt**:
```
在src/components/settings-popup.tsx中:
1. 导入AIProviderSettings组件
2. 在设置对话框中添加"AI提供商"部分
3. 传递settings和handleSettingsChange
4. 确保设置正确保存到store
```

---

### [x] 任务7.3: 创建OpenRouter模型列表

**文件**: `src/lib/ai-models.ts` (新建)

**目标**: 定义OpenRouter支持的模型列表

**实现步骤**:
1. 创建新文件
2. 导出OPENROUTER_MODELS常量
3. 包含常用的视觉模型

**代码参考**: design.md "3.2 设置接口扩展"

**验收标准**:
- ✅ 编译通过
- ✅ 模型列表完整

**_Prompt**:
```
创建src/lib/ai-models.ts文件。
导出OPENROUTER_MODELS常量数组,包含:
- anthropic/claude-3.5-sonnet
- google/gemini-pro-vision
- openai/gpt-4.1
- meta-llama/llama-3.2-90b-vision

每个模型包含id, name, vision字段。
参考design.md中的示例。
```

---

**阶段7测试检查点**:
```bash
# 1. 运行应用
npm run tauri dev

# 2. 测试设置界面:
# - 打开设置
# - 配置OpenAI API密钥
# - 点击测试连接
# - 配置OpenRouter
# - 选择不同模型
# - 启用/禁用Ollama
# - 保存设置

# 3. 验证设置持久化:
# - 关闭应用
# - 重新打开
# - 检查设置是否保存

# 确认:
# ✅ 所有配置项正常
# ✅ 测试连接功能正常
# ✅ 设置正确保存
# ✅ UI美观易用
```

---

## 阶段8: 优化和完善 (可选)

**目标**: 性能优化和用户体验提升
**测试点**: 应用流畅,体验良好
**预计时间**: 2小时

### [ ] 任务8.1: 实现图像压缩

**文件**: `src-tauri/src/lib.rs`

**目标**: 在保存前压缩大图像

**实现步骤**:
1. 在save_image中添加压缩逻辑
2. 检查图像尺寸
3. 如果超过2048px,缩放

**代码参考**: design.md "10.1 图像压缩"

**_Prompt**:
```
在src-tauri/src/lib.rs的save_image函数中添加图像压缩。
参考design.md中的"10.1 图像压缩"部分。

如果图像宽度或高度超过2048px,使用image::imageops::resize缩放。
```

---

### [ ] 任务8.2: 实现图像清理命令

**文件**: `src-tauri/src/lib.rs`

**目标**: 删除待办事项时清理图像文件

**实现步骤**:
1. 实现cleanup_todo_image命令
2. 验证路径安全
3. 删除文件
4. 注册命令

**代码参考**: design.md "2.5 主处理命令"

**_Prompt**:
```
在src-tauri/src/lib.rs中实现cleanup_todo_image命令。
参考design.md中的实现。

要求:
1. 接收image_path参数
2. 验证路径在app_data目录内
3. 删除文件
4. 在generate_handler!中注册
```

---

### [ ] 任务8.3: 在删除待办时清理图像

**文件**: `src/components/todo-window.tsx`

**目标**: 删除待办事项时调用清理命令

**实现步骤**:
1. 找到删除待办事项的函数
2. 检查todo.hasImage和todo.imagePath
3. 调用cleanup_todo_image

**_Prompt**:
```
在src/components/todo-window.tsx的删除待办事项函数中:
1. 在删除前检查todo.hasImage和todo.imagePath
2. 如果有图像,调用invoke('cleanup_todo_image', { imagePath: todo.imagePath })
3. 忽略清理错误(不影响删除操作)
```

---

### [ ] 任务8.4: 添加本地OCR后备(可选)

**文件**: `src-tauri/src/ai_service.rs`

**目标**: 实现process_with_local_ocr函数

**实现步骤**:
1. 添加tesseract依赖(可选)
2. 实现OCR逻辑
3. 返回ProcessingResult

**注意**: 这是可选任务,可以先返回占位符

**_Prompt**:
```
在src-tauri/src/ai_service.rs中实现process_with_local_ocr函数。
当前可以返回占位符结果。

未来可以集成tesseract-rs或leptess实现真正的OCR。
```

---

**阶段8测试检查点**:
```bash
# 1. 测试图像压缩:
# - 粘贴超大图像
# - 检查保存的文件大小
# - 验证压缩正常

# 2. 测试图像清理:
# - 创建带图像的待办事项
# - 记录图像路径
# - 删除待办事项
# - 检查图像文件是否删除

# 确认:
# ✅ 大图像自动压缩
# ✅ 删除待办时清理图像
# ✅ 应用性能良好
```

---

## 最终验收测试

### 完整功能测试清单

#### 1. 基础功能
- [ ] 可以粘贴图像到待办事项输入框
- [ ] 显示处理进度
- [ ] 创建带图像的待办事项
- [ ] 待办事项显示图像图标
- [ ] 点击待办事项查看图像

#### 2. AI功能
- [ ] OpenAI处理正常
- [ ] OpenRouter处理正常
- [ ] Ollama处理正常(如果已安装)
- [ ] 故障转移正常工作
- [ ] 返回合理的摘要

#### 3. 设置功能
- [ ] 可以配置API密钥
- [ ] 可以选择模型
- [ ] 测试连接功能正常
- [ ] 设置正确保存

#### 4. 图像查看
- [ ] 对话框正常打开
- [ ] 图像正确显示
- [ ] 缩放功能正常
- [ ] 元数据显示完整

#### 5. 数据持久化
- [ ] 待办事项正确保存
- [ ] 图像文件正确保存
- [ ] 设置正确保存
- [ ] 重启后数据完整

#### 6. 错误处理
- [ ] 无API密钥时提示清晰
- [ ] API调用失败时提示清晰
- [ ] 剪贴板无图像时提示清晰
- [ ] 网络错误时提示清晰

#### 7. 性能
- [ ] 图像处理速度合理
- [ ] UI响应流畅
- [ ] 无内存泄漏

#### 8. 跨平台
- [ ] macOS测试通过
- [ ] Windows测试通过(如果适用)
- [ ] Linux测试通过(如果适用)

---

## 任务执行建议

### 开发流程
1. **按阶段顺序执行** - 每个阶段完成后测试
2. **增量提交** - 每个任务完成后提交代码
3. **及时测试** - 不要积累太多未测试的代码
4. **记录问题** - 遇到问题及时记录和调整

### 调试技巧
```bash
# Rust日志
cd src-tauri
RUST_LOG=debug cargo run

# 前端日志
# 打开浏览器开发者工具查看console

# 检查文件
# macOS: ~/Library/Application Support/com.imagetodo.app/
# Windows: %APPDATA%/com.imagetodo.app/
# Linux: ~/.config/com.imagetodo.app/
```

### 常见问题

#### OCR相关
1. **Tesseract未安装** - 运行安装命令,检查PATH
2. **语言包缺失** - 安装chi_sim和eng语言包
3. **OCR识别率低** - 确保图像清晰,文字足够大
4. **leptess编译失败** - 确保Tesseract已正确安装

#### 通用问题
5. **图像不显示** - 检查文件路径和convertFileSrc
6. **设置不保存** - 检查store初始化
7. **编译错误** - 检查依赖版本

---

## 📋 任务文档更新总结 (v3.0)

### 核心变更
- ✅ **阶段3**: 从"AI服务层"改为"OCR服务层"(核心功能)
- ✅ **新增**: Tesseract安装任务
- ✅ **新增**: leptess依赖和OCR服务模块
- ✅ **移除**: DeepSeek相关任务(不支持视觉)
- ✅ **调整**: AI功能降级为可选增强(后续阶段)

### 实施顺序
1. **阶段1**: 基础设施(数据模型、国际化) ✅ 已完成
2. **阶段2**: 剪贴板和图像存储 ✅ 已完成
3. **阶段3**: OCR服务层 ⭐ **当前重点**
4. **阶段4-8**: UI集成、图像查看、设置、优化

### 下一步行动
开始实施**阶段3任务3.1**: 安装Tesseract OCR引擎

---

**任务文档版本**: 3.0 (OCR优先架构)
**创建日期**: 2025-01-03
**最后更新**: 2025-01-03
**状态**: 已更新 - 待审批

