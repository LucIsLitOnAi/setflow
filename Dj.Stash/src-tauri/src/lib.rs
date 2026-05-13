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
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePoolOptions, Row};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, USER_AGENT};
use std::env;

#[derive(Deserialize)]
struct DiscogsSearchResponse {
    results: Vec<DiscogsResult>,
}

#[derive(Deserialize)]
struct DiscogsResult {
    title: String,
    year: Option<String>,
    thumb: Option<String>,
}

#[derive(Serialize)]
struct ParsedDiscogsTrack {
    title: String,
    artist: String,
    year: Option<String>,
    cover_url: Option<String>,
}

#[derive(Serialize)]
struct Location {
    id: i32,
    name: String,
    location_type: String,
}

#[derive(Serialize)]
struct Track {
    id: i32,
    title: String,
    artist: String,
    format: String,
    location_id: Option<i32>,
    cover_url: Option<String>,
}

#[derive(Serialize)]
struct Set {
    id: i32,
    name: String,
}

#[derive(Serialize)]
struct TrackInSet {
    id: i32,
    title: String,
    artist: String,
    format: String,
    location_id: Option<i32>,
    order_index: Option<i32>,
    cover_url: Option<String>,
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

#[tauri::command]
async fn add_track(app: tauri::AppHandle, title: String, artist: String, format: String, location_id: Option<i32>, cover_url: Option<String>) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    sqlx::query("INSERT INTO tracks (title, artist, format, location_id, cover_url) VALUES (?, ?, ?, ?, ?)")
        .bind(title)
        .bind(artist)
        .bind(format)
        .bind(location_id)
        .bind(cover_url)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to insert track: {}", e))?;

    Ok("Track added successfully".to_string())
}

#[tauri::command]
async fn get_tracks(app: tauri::AppHandle) -> Result<Vec<Track>, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    let rows = sqlx::query("SELECT id, title, artist, format, location_id, cover_url FROM tracks")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to fetch tracks: {}", e))?;

    let mut tracks = Vec::new();
    for row in rows {
        tracks.push(Track {
            id: row.get("id"),
            title: row.get("title"),
            artist: row.get("artist"),
            format: row.get("format"),
            location_id: row.get("location_id"),
            cover_url: row.get("cover_url"),
        });
    }

    Ok(tracks)
}

#[tauri::command]
async fn update_track_location(app: tauri::AppHandle, track_id: i32, new_location_id: i32) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    sqlx::query("UPDATE tracks SET location_id = ? WHERE id = ?")
        .bind(new_location_id)
        .bind(track_id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to update track location: {}", e))?;

    Ok("Track location updated successfully".to_string())
}

#[tauri::command]
async fn delete_track(app: tauri::AppHandle, track_id: i32) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    sqlx::query("DELETE FROM tracks WHERE id = ?")
        .bind(track_id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to delete track: {}", e))?;

    Ok("Track deleted successfully".to_string())
}

#[tauri::command]
async fn create_set(app: tauri::AppHandle, name: String) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    sqlx::query("INSERT INTO sets (name) VALUES (?)")
        .bind(name)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to create set: {}", e))?;

    Ok("Set created successfully".to_string())
}

#[tauri::command]
async fn get_sets(app: tauri::AppHandle) -> Result<Vec<Set>, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    let rows = sqlx::query("SELECT id, name FROM sets")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to fetch sets: {}", e))?;

    let mut sets = Vec::new();
    for row in rows {
        sets.push(Set {
            id: row.get("id"),
            name: row.get("name"),
        });
    }

    Ok(sets)
}

#[tauri::command]
async fn add_track_to_set(app: tauri::AppHandle, set_id: i32, track_id: i32, order_index: i32) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    sqlx::query("INSERT INTO set_tracks (set_id, track_id, order_index) VALUES (?, ?, ?)")
        .bind(set_id)
        .bind(track_id)
        .bind(order_index)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to add track to set: {}", e))?;

    Ok("Track added to set successfully".to_string())
}

#[tauri::command]
async fn seed_test_data(app: tauri::AppHandle) -> Result<i32, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    // Clear existing data to ensure a clean state, especially important for Strict Mode double-firing
    sqlx::query("DELETE FROM set_tracks").execute(&pool).await.map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM sets").execute(&pool).await.map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM tracks").execute(&pool).await.map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM locations").execute(&pool).await.map_err(|e| e.to_string())?;

    // 1. Create a Location
    let location_id = sqlx::query("INSERT INTO locations (name, location_type) VALUES (?, ?) RETURNING id")
        .bind("Warehouse Berlin")
        .bind("warehouse")
        .fetch_one(&pool)
        .await
        .map_err(|e| format!("Failed to seed location: {}", e))?
        .get::<i32, _>("id");

    // 2. Create a Track
    let track_id = sqlx::query("INSERT INTO tracks (title, artist, format, location_id) VALUES (?, ?, ?, ?) RETURNING id")
        .bind("Test Vinyl 1")
        .bind("Unknown")
        .bind("analog")
        .bind(location_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| format!("Failed to seed track: {}", e))?
        .get::<i32, _>("id");

    // 3. Create a Set
    let set_id = sqlx::query("INSERT INTO sets (name) VALUES (?) RETURNING id")
        .bind("Berlin Gig 2026")
        .fetch_one(&pool)
        .await
        .map_err(|e| format!("Failed to seed set: {}", e))?
        .get::<i32, _>("id");

    // 4. Add Track to Set
    sqlx::query("INSERT INTO set_tracks (set_id, track_id, order_index) VALUES (?, ?, ?)")
        .bind(set_id)
        .bind(track_id)
        .bind(0)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to seed set_track: {}", e))?;

    Ok(set_id)
}

#[tauri::command]
async fn search_discogs(query: String) -> Result<ParsedDiscogsTrack, String> {
    let _ = dotenvy::dotenv();
    let token = env::var("DISCOGS_TOKEN").unwrap_or_else(|_| "DUMMY_TOKEN".to_string());

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("DjStash/1.0"));
    let auth_value = format!("Discogs token={}", token);
    if let Ok(header_val) = HeaderValue::from_str(&auth_value) {
        headers.insert(AUTHORIZATION, header_val);
    }

    let client = reqwest::Client::builder()
        .default_headers(headers)
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    let url = format!("https://api.discogs.com/database/search?q={}", query);

    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    if response.status().is_success() {
        let data: DiscogsSearchResponse = response.json().await.map_err(|e| format!("Failed to parse JSON: {}", e))?;

        if let Some(first_result) = data.results.into_iter().next() {
            let parts: Vec<&str> = first_result.title.splitn(2, " - ").collect();
            let (artist, title) = if parts.len() == 2 {
                (parts[0].to_string(), parts[1].to_string())
            } else {
                ("Unknown".to_string(), first_result.title)
            };

            Ok(ParsedDiscogsTrack {
                artist: artist.trim().to_string(),
                title: title.trim().to_string(),
                year: first_result.year,
                cover_url: first_result.thumb,
            })
        } else {
            Err("No results found on Discogs.".to_string())
        }
    } else {
        Err(format!("Discogs API returned error status: {}", response.status()))
    }
}

#[tauri::command]
async fn get_tracks_in_set(app: tauri::AppHandle, set_id: i32) -> Result<Vec<TrackInSet>, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("database.sqlite");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to db: {}", e))?;

    let rows = sqlx::query(
        "SELECT t.id, t.title, t.artist, t.format, t.location_id, t.cover_url, st.order_index
         FROM tracks t
         INNER JOIN set_tracks st ON t.id = st.track_id
         WHERE st.set_id = ?
         ORDER BY st.order_index ASC"
    )
    .bind(set_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch tracks in set: {}", e))?;

    let mut tracks = Vec::new();
    for row in rows {
        tracks.push(TrackInSet {
            id: row.get("id"),
            title: row.get("title"),
            artist: row.get("artist"),
            format: row.get("format"),
            location_id: row.get("location_id"),
            order_index: row.get("order_index"),
            cover_url: row.get("cover_url"),
        });
    }

    Ok(tracks)
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
        },
        Migration {
            version: 2,
            description: "create_tracks_table",
            sql: "CREATE TABLE IF NOT EXISTS tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                artist TEXT NOT NULL,
                format TEXT NOT NULL,
                location_id INTEGER,
                FOREIGN KEY(location_id) REFERENCES locations(id)
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_sets_and_set_tracks_tables",
            sql: "CREATE TABLE IF NOT EXISTS sets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS set_tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                set_id INTEGER NOT NULL,
                track_id INTEGER NOT NULL,
                order_index INTEGER,
                FOREIGN KEY(set_id) REFERENCES sets(id) ON DELETE CASCADE,
                FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_cover_url_to_tracks",
            sql: "ALTER TABLE tracks ADD COLUMN cover_url TEXT;",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        // Initialize tauri-plugin-sql with migrations to auto-create the table
        .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:database.sqlite", migrations).build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            test_db_connection,
            add_location,
            get_locations,
            add_track,
            get_tracks,
            update_track_location,
            delete_track,
            create_set,
            get_sets,
            add_track_to_set,
            get_tracks_in_set,
            seed_test_data,
            search_discogs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
