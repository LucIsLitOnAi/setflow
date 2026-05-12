// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use tauri::Manager;
use std::path::PathBuf;

#[tauri::command]
async fn test_db_connection(app: tauri::AppHandle) -> Result<String, String> {
    // Determine the path where the tauri-plugin-sql stores the database file
    // Typically it's in the app's standard config/data directory.
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    if db_path.exists() {
        Ok(format!("DB connection successful. DB exists at: {:?}", db_path))
    } else {
        Err(format!("DB connection failed. File not found at: {:?}", db_path))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Initialize tauri-plugin-sql to connect to database.sqlite
        // Note: the plugin is also defined in tauri.conf.json's plugins.sql section
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, test_db_connection])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
