use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessingResult {
    pub summary: String,
    pub raw_text: String,
    pub method: String,
    pub provider: String,
    pub model: String,
}

/// AI提供商配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIProvider {
    pub name: String,          // "openai", "openrouter", "ollama"
    pub api_base: String,      // API基础URL
    pub api_key: Option<String>,
    pub model: String,         // 模型名称
    pub enabled: bool,
}

impl AIProvider {
    /// OpenAI官方
    pub fn openai(api_key: String) -> Self {
        Self {
            name: "openai".to_string(),
            api_base: "https://api.openai.com/v1".to_string(),
            api_key: Some(api_key),
            model: "gpt-4-vision-preview".to_string(),
            enabled: true,
        }
    }

    /// DeepSeek (兼容OpenAI格式)
    pub fn deepseek(api_key: String) -> Self {
        Self {
            name: "deepseek".to_string(),
            api_base: "https://api.deepseek.com/v1".to_string(),
            api_key: Some(api_key),
            model: "deepseek-chat".to_string(),
            enabled: true,
        }
    }

    /// OpenRouter (支持多个模型)
    pub fn openrouter(api_key: String, model: Option<String>) -> Self {
        Self {
            name: "openrouter".to_string(),
            api_base: "https://openrouter.ai/api/v1".to_string(),
            api_key: Some(api_key),
            model: model.unwrap_or("anthropic/claude-3.5-sonnet".to_string()),
            enabled: true,
        }
    }

    /// Ollama本地模型
    pub fn ollama(model: Option<String>) -> Self {
        Self {
            name: "ollama".to_string(),
            api_base: "http://localhost:11434/v1".to_string(),
            api_key: None,
            model: model.unwrap_or("llava".to_string()),
            enabled: true,
        }
    }
}

/// OpenAI兼容API请求结构(文本模式)
#[derive(Debug, Serialize)]
struct OpenAICompatibleRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Debug, Serialize)]
struct OpenAIMessage {
    role: String,
    content: String,  // 简化为纯文本
}

#[derive(Debug, Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
}

#[derive(Debug, Deserialize)]
struct OpenAIChoice {
    message: OpenAIResponseMessage,
}

#[derive(Debug, Deserialize)]
struct OpenAIResponseMessage {
    content: String,
}

/// AI文本总结 (可选功能)
/// 输入: OCR提取的文本
/// 输出: AI生成的简洁摘要
pub async fn summarize_text_with_ai(
    text: &str,
    provider: &AIProvider,
    locale: &str,
) -> Result<String, String> {
    // 构建提示词
    let prompt = if locale == "zh-CN" {
        format!("请将以下文本总结成1-2句话的待办事项描述:\n\n{}", text)
    } else {
        format!("Please summarize the following text into a 1-2 sentence todo item description:\n\n{}", text)
    };

    // 构建OpenAI兼容请求(纯文本,无需Vision)
    let request = OpenAICompatibleRequest {
        model: provider.model.clone(),
        messages: vec![OpenAIMessage {
            role: "user".to_string(),
            content: prompt,
        }],
        max_tokens: 200,
        temperature: 0.3,
    };

    // 构建API URL
    let api_url = format!("{}/chat/completions", provider.api_base);

    // 发送请求
    let client = reqwest::Client::new();
    let mut request_builder = client
        .post(&api_url)
        .header("Content-Type", "application/json")
        .json(&request)
        .timeout(std::time::Duration::from_secs(30));

    // 添加认证头(如果需要)
    if let Some(api_key) = &provider.api_key {
        request_builder = request_builder.header("Authorization", format!("Bearer {}", api_key));
    }

    // OpenRouter需要额外的头
    if provider.name == "openrouter" {
        request_builder = request_builder
            .header("HTTP-Referer", "https://imagetodo.app")
            .header("X-Title", "ImageTodo");
    }

    let response = request_builder
        .send()
        .await
        .map_err(|e| format!("AI总结请求失败 ({}): {}", provider.name, e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("AI总结失败 {} ({}): {}", status, provider.name, error_text));
    }

    let api_response: OpenAIResponse = response
        .json()
        .await
        .map_err(|e| format!("解析AI响应失败 ({}): {}", provider.name, e))?;

    let summary = api_response.choices
        .first()
        .ok_or(format!("AI响应为空 ({})", provider.name))?
        .message
        .content
        .trim()
        .to_string();

    Ok(summary)
}

/// Tauri命令: AI文本总结
#[tauri::command]
pub async fn summarize_text_ai(
    text: String,
    api_key: String,
    provider_name: Option<String>,
    locale: String,
) -> Result<String, String> {
    let provider = match provider_name.as_deref() {
        Some("openrouter") => AIProvider::openrouter(api_key, None),
        Some("ollama") => AIProvider::ollama(None),
        _ => AIProvider::openai(api_key),
    };

    summarize_text_with_ai(&text, &provider, &locale).await
}

/// 使用最佳提供商进行文本总结(智能故障转移)
pub async fn summarize_with_best_provider(
    text: &str,
    providers: Vec<AIProvider>,
    locale: &str,
) -> Result<String, String> {
    let mut last_error = String::from("未配置AI提供商");

    for provider in providers {
        if !provider.enabled {
            continue;
        }

        eprintln!("尝试使用AI提供商: {} (模型: {})", provider.name, provider.model);

        match summarize_text_with_ai(text, &provider, locale).await {
            Ok(summary) => {
                eprintln!("✅ AI总结成功: {} (模型: {})", provider.name, provider.model);
                return Ok(summary);
            }
            Err(e) => {
                eprintln!("❌ AI提供商 {} 失败: {}", provider.name, e);
                last_error = format!("{} 失败: {}", provider.name, e);
                // 继续尝试下一个提供商
            }
        }
    }

    // 所有提供商都失败
    Err(format!("所有AI提供商都失败了。最后错误: {}", last_error))
}


