use leptess::LepTess;
use serde::{Serialize, Deserialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct OcrResult {
    pub text: String,
    pub confidence: f32,
    pub language: String,
}

/// 从图像文件识别文本
pub fn recognize_from_file(image_path: &str) -> Result<OcrResult, String> {
    eprintln!("OCR: 开始处理图像: {}", image_path);

    // 初始化Tesseract,支持中英文
    let mut tesseract = LepTess::new(None, "chi_sim+eng")
        .map_err(|e| format!("Tesseract初始化失败: {}. 请确保已安装Tesseract和语言包(chi_sim, eng)", e))?;

    eprintln!("OCR: Tesseract初始化成功");

    // 加载图像
    tesseract.set_image(image_path)
        .map_err(|e| format!("加载图像失败: {}. 路径: {}", e, image_path))?;

    eprintln!("OCR: 图像加载成功");

    // 执行OCR
    let text = tesseract.get_utf8_text()
        .map_err(|e| format!("OCR识别失败: {}", e))?;

    eprintln!("OCR: 识别完成,文本长度: {}", text.len());

    // 获取置信度
    let confidence = tesseract.mean_text_conf() as f32;

    eprintln!("OCR: 置信度: {:.2}%", confidence);

    Ok(OcrResult {
        text: text.trim().to_string(),
        confidence,
        language: "chi_sim+eng".to_string(),
    })
}

/// Tauri命令: 处理图像OCR
#[tauri::command]
pub async fn process_image_ocr(image_path: String) -> Result<OcrResult, String> {
    // 验证文件存在
    if !Path::new(&image_path).exists() {
        return Err(format!("图像文件不存在: {}", image_path));
    }

    // 执行OCR
    let result = recognize_from_file(&image_path)?;

    // 检查是否识别到文本
    if result.text.is_empty() {
        return Err(format!("未识别到文本内容。置信度: {:.2}%", result.confidence));
    }

    Ok(result)
}

