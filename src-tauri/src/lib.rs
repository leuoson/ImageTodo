use xcap::Monitor;
use chrono::Local;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

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
    error: Option<String>,
}

/// Capture screenshot of the primary monitor
#[tauri::command]
fn capture_screenshot() -> Result<ScreenshotResult, String> {
    // Get all monitors
    let monitors = Monitor::all()
        .map_err(|e| format!("Failed to get monitors: {}", e))?;

    // Find primary monitor
    let primary_monitor = monitors
        .into_iter()
        .find(|m| m.is_primary().unwrap_or(false))
        .ok_or_else(|| "No primary monitor found".to_string())?;

    // Capture screen
    let image = primary_monitor
        .capture_image()
        .map_err(|e| format!("Failed to capture screen: {}", e))?;

    // Generate filename with timestamp
    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("screenshot_{}.png", timestamp);

    // Get download directory
    let download_dir = get_download_dir()
        .ok_or_else(|| "Failed to get download directory".to_string())?;

    let file_path = download_dir.join(&filename);

    // Save image
    image.save(&file_path)
        .map_err(|e| format!("Failed to save screenshot: {}", e))?;

    Ok(ScreenshotResult {
        success: true,
        path: Some(file_path.to_string_lossy().to_string()),
        error: None,
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
            error: Some("选择区域过小,最小尺寸为50x50像素".to_string()),
        });
    }

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

    // Generate filename with timestamp
    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("screenshot_region_{}.png", timestamp);

    // Get download directory
    let download_dir = get_download_dir()
        .ok_or_else(|| "Failed to get download directory".to_string())?;

    let file_path = download_dir.join(&filename);

    // Save image
    image.save(&file_path)
        .map_err(|e| format!("Failed to save screenshot: {}", e))?;

    // Close selector window
    if let Some(window) = app.get_webview_window("region-selector") {
        window.close().ok();
    }

    Ok(ScreenshotResult {
        success: true,
        path: Some(file_path.to_string_lossy().to_string()),
        error: None,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Register global shortcut plugin with handler
            use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

            let app_handle = app.handle().clone();
            let alt_shift_p = Shortcut::new(Some(Modifiers::ALT | Modifiers::SHIFT), Code::KeyP);

            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |_app, shortcut, event| {
                        if shortcut == &alt_shift_p && event.state() == ShortcutState::Pressed {
                            // Create selector window when Alt+Shift+P is pressed
                            if let Err(e) = create_selector_window(&app_handle) {
                                eprintln!("Failed to create selector window: {}", e);
                            }
                        }
                    })
                    .build(),
            )?;

            // Register the shortcut
            app.global_shortcut().register(alt_shift_p)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            capture_screenshot,
            capture_screen_region
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
