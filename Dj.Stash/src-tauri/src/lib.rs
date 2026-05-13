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

use tauri_plugin_sql::{Migration, MigrationKind};
use serde::Serialize;
use sqlx::{sqlite::SqlitePoolOptions, Row};

#[derive(Serialize)]
struct Location {
    id: i32,
    name: String,
    location_type: String,
}

#[tauri::command]
async fn add_location(app: tauri::AppHandle, name: String, location_type: String) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    sqlx::query("INSERT INTO locations (name, location_type) VALUES (?, ?)")
        .bind(name)
        .bind(location_type)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to insert location: {}", e))?;

    Ok("Location added successfully".to_string())
}

#[tauri::command]
async fn get_locations(app: tauri::AppHandle) -> Result<Vec<Location>, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    let rows = sqlx::query("SELECT id, name, location_type FROM locations")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to fetch locations: {}", e))?;

    let mut locations = Vec::new();
    for row in rows {
        locations.push(Location {
            id: row.get("id"),
            name: row.get("name"),
            location_type: row.get("location_type"),
        });
    }

    Ok(locations)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_locations_table",
            sql: "CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                location_type TEXT NOT NULL
            );",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        // Initialize tauri-plugin-sql with migrations to auto-create the table
        .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:database.sqlite", migrations).build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, test_db_connection, add_location, get_locations])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
