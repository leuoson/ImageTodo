mod models;
mod storage;

use anyhow::{Context, Result};
use tauri::{App, Manager, State};

use crate::models::TodoItem;
use crate::storage::TodoStorage;

struct AppState {
    storage: TodoStorage,
}

impl AppState {
    fn initialize(app: &App) -> Result<Self> {
        let handle = app.handle();
        let storage = TodoStorage::new(&handle).context("failed to initialise todo storage")?;
        Ok(Self { storage })
    }

    fn storage(&self) -> &TodoStorage {
        &self.storage
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(
            |app: &mut tauri::App| -> std::result::Result<(), Box<dyn std::error::Error>> {
                let state = AppState::initialize(&*app)?;
                app.manage(state);
                ensure_main_window(&*app)?;
                Ok(())
            },
        )
        .invoke_handler(tauri::generate_handler![load_todos, save_todos])
        .run(tauri::generate_context!())
        .expect("failed to start ImageTodo application");
}

fn ensure_main_window(app: &App) -> Result<()> {
    let window = app
        .get_webview_window("main")
        .context("main window has not been created")?;

    window.set_focus().context("failed to focus main window")?;

    Ok(())
}

#[tauri::command]
async fn load_todos(state: State<'_, AppState>) -> Result<Vec<TodoItem>, String> {
    state
        .storage()
        .load_todos()
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn save_todos(state: State<'_, AppState>, todos: Vec<TodoItem>) -> Result<(), String> {
    state
        .storage()
        .save_todos(&todos)
        .await
        .map_err(|error| error.to_string())
}
