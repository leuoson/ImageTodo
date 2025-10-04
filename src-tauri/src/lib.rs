mod ai_service;
mod ocr_service;

use ai_service::AIProvider;
use xcap::Monitor;
use chrono::Local;
use std::path::PathBuf;
use std::thread;
use std::time::Duration;
use serde::{Serialize, Deserialize};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use arboard::{Clipboard, ImageData};
use std::borrow::Cow;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Screenshot result structure
#[derive(Debug, Serialize, Deserialize)]
struct ScreenshotResult {
    success: bool,
    path: Option<String>,
    message: Option<String>,
    error: Option<String>,
}

/// Image data structure for clipboard
#[derive(Debug, Serialize, Deserialize)]
struct ClipboardImageData {
    width: usize,
    height: usize,
    bytes: Vec<u8>,
}

/// Image processing result
#[derive(Debug, Serialize, Deserialize)]
struct ImageProcessingResult {
    success: bool,
    summary: Option<String>,
    raw_text: Option<String>,
    method: String,
    provider: Option<String>,
    model: Option<String>,
    error: Option<String>,
}

/// App settings structure (matching frontend)
#[derive(Debug, Serialize, Deserialize)]
struct AppSettings {
    locale: String,
    #[serde(rename = "regionCaptureShortcut")]
    region_capture_shortcut: String,
}

/// Parse shortcut string and convert to Tauri Shortcut
/// Format: "Alt+Shift+P" -> Shortcut with modifiers and key
fn parse_shortcut(shortcut_str: &str) -> Option<tauri_plugin_global_shortcut::Shortcut> {
    use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut};

    let parts: Vec<&str> = shortcut_str.split('+').map(|s| s.trim()).collect();
    if parts.is_empty() {
        return None;
    }

    let mut modifiers = Modifiers::empty();
    let mut key_code: Option<Code> = None;

    for part in parts {
        match part.to_lowercase().as_str() {
            "alt" => modifiers |= Modifiers::ALT,
            "shift" => modifiers |= Modifiers::SHIFT,
            "ctrl" | "control" => modifiers |= Modifiers::CONTROL,
            "cmd" | "meta" | "super" => modifiers |= Modifiers::META,
            // Parse key code
            key => {
                key_code = match key.to_uppercase().as_str() {
                    "A" => Some(Code::KeyA),
                    "B" => Some(Code::KeyB),
                    "C" => Some(Code::KeyC),
                    "D" => Some(Code::KeyD),
                    "E" => Some(Code::KeyE),
                    "F" => Some(Code::KeyF),
                    "G" => Some(Code::KeyG),
                    "H" => Some(Code::KeyH),
                    "I" => Some(Code::KeyI),
                    "J" => Some(Code::KeyJ),
                    "K" => Some(Code::KeyK),
                    "L" => Some(Code::KeyL),
                    "M" => Some(Code::KeyM),
                    "N" => Some(Code::KeyN),
                    "O" => Some(Code::KeyO),
                    "P" => Some(Code::KeyP),
                    "Q" => Some(Code::KeyQ),
                    "R" => Some(Code::KeyR),
                    "S" => Some(Code::KeyS),
                    "T" => Some(Code::KeyT),
                    "U" => Some(Code::KeyU),
                    "V" => Some(Code::KeyV),
                    "W" => Some(Code::KeyW),
                    "X" => Some(Code::KeyX),
                    "Y" => Some(Code::KeyY),
                    "Z" => Some(Code::KeyZ),
                    "0" => Some(Code::Digit0),
                    "1" => Some(Code::Digit1),
                    "2" => Some(Code::Digit2),
                    "3" => Some(Code::Digit3),
                    "4" => Some(Code::Digit4),
                    "5" => Some(Code::Digit5),
                    "6" => Some(Code::Digit6),
                    "7" => Some(Code::Digit7),
                    "8" => Some(Code::Digit8),
                    "9" => Some(Code::Digit9),
                    "F1" => Some(Code::F1),
                    "F2" => Some(Code::F2),
                    "F3" => Some(Code::F3),
                    "F4" => Some(Code::F4),
                    "F5" => Some(Code::F5),
                    "F6" => Some(Code::F6),
                    "F7" => Some(Code::F7),
                    "F8" => Some(Code::F8),
                    "F9" => Some(Code::F9),
                    "F10" => Some(Code::F10),
                    "F11" => Some(Code::F11),
                    "F12" => Some(Code::F12),
                    _ => None,
                };
            }
        }
    }

    key_code.map(|code| {
        if modifiers.is_empty() {
            Shortcut::new(None, code)
        } else {
            Shortcut::new(Some(modifiers), code)
        }
    })
}

/// Get download directory path (cross-platform)
fn get_download_dir() -> Option<PathBuf> {
    dirs::download_dir()
}

/// Create selector window for region capture
fn create_selector_window(app: &tauri::AppHandle) -> Result<(), String> {
    // Check if selector window already exists
    if app.get_webview_window("region-selector").is_some() {
        return Ok(()); // Already exists, don't create duplicate
    }

    // Get primary monitor
    let monitors = Monitor::all()
        .map_err(|e| format!("Failed to get monitors: {}", e))?;

    let monitor = monitors
        .into_iter()
        .find(|m| m.is_primary().unwrap_or(false))
        .ok_or_else(|| "No primary monitor found".to_string())?;

    // Get monitor dimensions
    let width = monitor.width()
        .map_err(|e| format!("Failed to get monitor width: {}", e))?;
    let height = monitor.height()
        .map_err(|e| format!("Failed to get monitor height: {}", e))?;

    // Create overlay window that covers the entire screen
    // Note: We don't use fullscreen(true) because it would minimize other apps
    // Instead, we create a borderless window that covers the screen
    let window = WebviewWindowBuilder::new(
        app,
        "region-selector",
        WebviewUrl::App("selector.html".into())
    )
    .title("Region Selector")
    .inner_size(width as f64, height as f64)
    .position(0.0, 0.0)
    .decorations(false)      // No window chrome
    .transparent(true)       // Transparent background
    .always_on_top(true)     // Stay above all windows
    .skip_taskbar(true)      // Don't show in taskbar
    .resizable(false)        // Not resizable
    .focused(true)           // Ensure window gets focus
    .build()
    .map_err(|e| format!("Failed to create selector window: {}", e))?;

    // Set focus to the window
    window.set_focus().map_err(|e| format!("Failed to set focus: {}", e))?;

    Ok(())
}

/// Read image from clipboard
#[tauri::command]
fn read_clipboard_image() -> Result<ClipboardImageData, String> {
    let mut clipboard = Clipboard::new()
        .map_err(|e| format!("无法访问剪贴板: {}", e))?;

    let image = clipboard
        .get_image()
        .map_err(|e| format!("剪贴板中没有图像: {}", e))?;

    Ok(ClipboardImageData {
        width: image.width,
        height: image.height,
        bytes: image.bytes.to_vec(),
    })
}

/// Save image to local storage
#[tauri::command]
fn save_image(
    app: tauri::AppHandle,
    image_data: Vec<u8>,
    width: u32,
    height: u32,
    todo_id: String,
) -> Result<String, String> {
    use image::RgbaImage;
    use std::fs;

    // Get app data directory
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("无法获取应用数据目录: {}", e))?;

    // Create images subdirectory
    let images_dir = app_data_dir.join("images");
    fs::create_dir_all(&images_dir)
        .map_err(|e| format!("无法创建图像目录: {}", e))?;

    // Generate filename
    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("{}_{}.png", todo_id, timestamp);
    let file_path = images_dir.join(&filename);

    // Convert bytes to image
    let img = RgbaImage::from_raw(width, height, image_data)
        .ok_or("无效的图像数据")?;

    // Save image
    img.save(&file_path)
        .map_err(|e| format!("保存图像失败: {}", e))?;

    eprintln!("图像已保存: {} ({}x{})", file_path.display(), width, height);

    Ok(file_path.to_string_lossy().to_string())
}

/// 从设置加载AI提供商配置
fn load_ai_providers(app: &tauri::AppHandle) -> Vec<AIProvider> {
    use tauri_plugin_store::StoreExt;

    let mut providers = Vec::new();

    let store = match app.store("settings.json") {
        Ok(s) => s,
        Err(_) => return providers,
    };

    // Reload to get latest settings
    if let Err(_) = store.reload() {
        return providers;
    }

    let settings = match store.get("settings") {
        Some(s) => s,
        None => return providers,
    };

    // DeepSeek (优先级最高,性价比最好)
    if let Some(deepseek_key) = settings.get("deepseekApiKey").and_then(|v| v.as_str()) {
        if !deepseek_key.is_empty() {
            let mut provider = AIProvider::deepseek(deepseek_key.to_string());
            // 如果用户配置了模型,使用用户配置的
            if let Some(model) = settings.get("deepseekModel").and_then(|v| v.as_str()) {
                provider.model = model.to_string();
            }
            providers.push(provider);
        }
    }

    // OpenAI
    if let Some(openai_key) = settings.get("openaiApiKey").and_then(|v| v.as_str()) {
        if !openai_key.is_empty() {
            providers.push(AIProvider::openai(openai_key.to_string()));
        }
    }

    // OpenRouter (支持Claude, Gemini等)
    if let Some(openrouter_key) = settings.get("openrouterApiKey").and_then(|v| v.as_str()) {
        if !openrouter_key.is_empty() {
            let model = settings.get("openrouterModel")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            providers.push(AIProvider::openrouter(openrouter_key.to_string(), model));
        }
    }

    // Ollama本地模型
    if let Some(use_ollama) = settings.get("useOllama").and_then(|v| v.as_bool()) {
        if use_ollama {
            let model = settings.get("ollamaModel")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            providers.push(AIProvider::ollama(model));
        }
    }

    providers
}

/// 获取可用的AI提供商列表
#[tauri::command]
fn get_available_ai_providers(app: tauri::AppHandle) -> Vec<AIProvider> {
    load_ai_providers(&app)
}

/// AI文本总结(支持多提供商)
#[tauri::command]
async fn summarize_text_multi_provider(
    app: tauri::AppHandle,
    text: String,
    locale: String,
) -> Result<String, String> {
    // 加载所有配置的AI提供商
    let providers = load_ai_providers(&app);

    if providers.is_empty() {
        return Err("未配置AI提供商。请在设置中配置OpenAI、OpenRouter或Ollama。".to_string());
    }

    // 使用智能故障转移
    ai_service::summarize_with_best_provider(&text, providers, &locale).await
}

/// Capture a region of the screen
#[tauri::command]
fn capture_screen_region(
    app: tauri::AppHandle,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<ScreenshotResult, String> {
    // Validate minimum size
    if width < 50 || height < 50 {
        return Ok(ScreenshotResult {
            success: false,
            path: None,
            message: None,
            error: Some("选择区域过小,最小尺寸为50x50像素".to_string()),
        });
    }

    // 1. Get window reference first
    let window = app
        .get_webview_window("region-selector")
        .ok_or("Failed to get selector window")?;

    // 2. Hide window before capturing
    window
        .hide()
        .map_err(|e| format!("Failed to hide window: {}", e))?;

    // 3. Wait for window to be fully hidden
    thread::sleep(Duration::from_millis(100));

    // 4. Now capture the screen (overlay is no longer visible)
    // Get primary monitor
    let monitors = Monitor::all()
        .map_err(|e| format!("Failed to get monitors: {}", e))?;

    let monitor = monitors
        .into_iter()
        .find(|m| m.is_primary().unwrap_or(false))
        .ok_or_else(|| "No primary monitor found".to_string())?;

    // Get monitor dimensions for boundary checking
    let monitor_width = monitor.width()
        .map_err(|e| format!("Failed to get monitor width: {}", e))? as i32;
    let monitor_height = monitor.height()
        .map_err(|e| format!("Failed to get monitor height: {}", e))? as i32;

    // Boundary check and adjustment
    let x = x.max(0).min(monitor_width - width as i32);
    let y = y.max(0).min(monitor_height - height as i32);
    let width = width.min((monitor_width - x) as u32);
    let height = height.min((monitor_height - y) as u32);

    // Convert to u32 for xcap (coordinates are guaranteed to be non-negative after boundary check)
    let x_u32 = x as u32;
    let y_u32 = y as u32;

    // Capture screen region
    let image = monitor
        .capture_region(x_u32, y_u32, width, height)
        .map_err(|e| format!("Failed to capture region: {}", e))?;

    // 5. Generate filename with timestamp
    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("screenshot_region_{}.png", timestamp);

    // Get download directory
    let download_dir = get_download_dir()
        .ok_or_else(|| "Failed to get download directory".to_string())?;

    let file_path = download_dir.join(&filename);

    // Save image
    image.save(&file_path)
        .map_err(|e| format!("Failed to save screenshot: {}", e))?;

    // 6. Copy to clipboard
    let clipboard_result = (|| -> Result<(), String> {
        // Create clipboard instance
        let mut clipboard = Clipboard::new()
            .map_err(|e| format!("Failed to access clipboard: {}", e))?;

        // Convert xcap's RgbaImage to arboard's ImageData
        let (width, height) = image.dimensions();
        let rgba_data = image.to_vec();

        let img_data = ImageData {
            width: width as usize,
            height: height as usize,
            bytes: Cow::from(rgba_data),
        };

        // Set clipboard content
        clipboard
            .set_image(img_data)
            .map_err(|e| format!("Failed to set clipboard: {}", e))?;

        Ok(())
    })();

    // Generate message based on clipboard operation result
    let message = match clipboard_result {
        Ok(_) => format!("截图已保存并复制到剪贴板: {}", filename),
        Err(e) => {
            eprintln!("Clipboard error: {}", e);
            format!("截图已保存,但复制到剪贴板失败: {}", filename)
        }
    };

    // 7. Close window at the end
    window.close().ok();

    Ok(ScreenshotResult {
        success: true,
        path: Some(file_path.to_string_lossy().to_string()),
        message: Some(message),
        error: None,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
            use tauri_plugin_store::StoreExt;

            let app_handle = app.handle().clone();

            // Read shortcut from settings store
            let store = app.store("settings.json")?;
            let shortcut_str = if let Some(settings) = store.get("settings") {
                if let Some(shortcut) = settings.get("regionCaptureShortcut") {
                    if let Some(s) = shortcut.as_str() {
                        s.to_string()
                    } else {
                        "Alt+Shift+P".to_string()
                    }
                } else {
                    "Alt+Shift+P".to_string()
                }
            } else {
                "Alt+Shift+P".to_string()
            };

            println!("Loading region capture shortcut from settings: {}", shortcut_str);

            // Parse shortcut string
            let shortcut = match parse_shortcut(&shortcut_str) {
                Some(s) => s,
                None => {
                    eprintln!("Failed to parse shortcut '{}', using default Alt+Shift+P", shortcut_str);
                    parse_shortcut("Alt+Shift+P").unwrap()
                }
            };

            println!("Registering shortcut: {:?}", shortcut);

            // Register global shortcut plugin with handler
            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |_app, triggered_shortcut, event| {
                        if triggered_shortcut == &shortcut && event.state() == ShortcutState::Pressed {
                            // Create selector window when shortcut is pressed
                            if let Err(e) = create_selector_window(&app_handle) {
                                eprintln!("Failed to create selector window: {}", e);
                            }
                        }
                    })
                    .build(),
            )?;

            // Register the shortcut
            match app.global_shortcut().register(shortcut.clone()) {
                Ok(_) => println!("Successfully registered shortcut: {:?}", shortcut),
                Err(e) => eprintln!("Failed to register shortcut: {}", e),
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            capture_screen_region,
            read_clipboard_image,
            save_image,
            ocr_service::process_image_ocr,
            ai_service::summarize_text_ai,
            summarize_text_multi_provider,
            get_available_ai_providers
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
