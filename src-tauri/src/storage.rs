use std::path::{Path, PathBuf};

use anyhow::{anyhow, Context, Result};
use tauri::{AppHandle, Manager};
use tokio::fs;

use crate::models::TodoItem;

const TODOS_FILE: &str = "todos.json";
const TODOS_BACKUP_FILE: &str = "todos.backup.json";

pub struct TodoStorage {
    data_dir: PathBuf,
    backup_dir: PathBuf,
}

impl TodoStorage {
    pub fn new(app: &AppHandle) -> Result<Self> {
        let resolver = app.path();
        let base_dir = resolver
            .app_data_dir()
            .context("failed to resolve application data directory")?;
        let data_dir = base_dir.join("data");
        let backup_dir = base_dir.join("backups");

        Ok(Self {
            data_dir,
            backup_dir,
        })
    }

    fn todos_path(&self) -> PathBuf {
        self.data_dir.join(TODOS_FILE)
    }

    fn backup_path(&self) -> PathBuf {
        self.backup_dir.join(TODOS_BACKUP_FILE)
    }

    pub async fn load_todos(&self) -> Result<Vec<TodoItem>> {
        let path = self.todos_path();
        match fs::read(&path).await {
            Ok(content) => match Self::deserialize(&content) {
                Ok(todos) => Ok(todos),
                Err(_) => self.restore_from_backup().await,
            },
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                self.ensure_directories().await?;
                Ok(Vec::new())
            }
            Err(error) => Err(anyhow!(error).context("failed to read todos file")),
        }
    }

    pub async fn save_todos(&self, todos: &[TodoItem]) -> Result<()> {
        self.ensure_directories().await?;
        let path = self.todos_path();
        let tmp_path = temporary_path(&path);
        let payload = serde_json::to_vec_pretty(todos).context("failed to serialize todos")?;

        fs::write(&tmp_path, payload)
            .await
            .context("failed to write temporary todos file")?;

        if fs::metadata(&path).await.is_ok() {
            self.write_backup(&path).await?;
        }

        fs::rename(&tmp_path, &path)
            .await
            .context("failed to move temporary todos file into place")?;

        Ok(())
    }

    async fn restore_from_backup(&self) -> Result<Vec<TodoItem>> {
        let backup_path = self.backup_path();
        let content = match fs::read(&backup_path).await {
            Ok(bytes) => bytes,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
            Err(error) => return Err(anyhow!(error).context("failed to read todos backup file")),
        };
        Self::deserialize(&content)
    }

    async fn write_backup(&self, source: &Path) -> Result<()> {
        let backup_path = self.backup_path();
        fs::create_dir_all(&self.backup_dir)
            .await
            .context("failed to create backup directory")?;
        fs::copy(source, backup_path)
            .await
            .context("failed to create todos backup")?;
        Ok(())
    }

    async fn ensure_directories(&self) -> Result<()> {
        fs::create_dir_all(&self.data_dir)
            .await
            .context("failed to create data directory")?;
        Ok(())
    }

    fn deserialize(content: &[u8]) -> Result<Vec<TodoItem>> {
        if content.is_empty() {
            return Ok(Vec::new());
        }
        serde_json::from_slice(content).context("failed to deserialize todos")
    }
}

fn temporary_path(path: &Path) -> PathBuf {
    let mut tmp = path.as_os_str().to_owned();
    tmp.push(".tmp");
    PathBuf::from(tmp)
}
