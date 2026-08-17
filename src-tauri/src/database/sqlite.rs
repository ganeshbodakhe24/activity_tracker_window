use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;
use std::time::Duration;
use crate::database::schema::*;
use crate::classifier::keywords::*;

pub fn get_db_path() -> PathBuf {
    let base_dir = if let Ok(local_appdata) = std::env::var("LOCALAPPDATA") {
        PathBuf::from(local_appdata).join("activity_tracker")
    } else if let Ok(appdata) = std::env::var("APPDATA") {
        PathBuf::from(appdata).join("activity_tracker")
    } else if let Ok(userprofile) = std::env::var("USERPROFILE") {
        PathBuf::from(userprofile).join(".activity_tracker")
    } else {
        std::env::temp_dir().join("activity_tracker")
    };

    let _ = fs::create_dir_all(&base_dir);
    let target_db = base_dir.join("activity_tracker.db");

    // If target db does not exist, check if there is an existing database from development/exe directory
    if !target_db.exists() {
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                let exe_db = exe_dir.join("activity_tracker.db");
                if exe_db.exists() {
                    let _ = fs::copy(&exe_db, &target_db);
                }
            }
        }
    }

    target_db
}

pub fn get_connection() -> Result<Connection> {
    let db_path = get_db_path();
    let conn = Connection::open(&db_path)?;

    // Wait up to 5 seconds if the database is busy
    conn.busy_timeout(Duration::from_secs(5))?;

    // Enable foreign keys
    conn.pragma_update(None, "foreign_keys", "ON")?;

    // Enable WAL mode (better concurrency)
    conn.pragma_update(None, "journal_mode", "WAL")?;

    let create_schemas = format!(
        "{}{}{}{}{}{}{}{}{}{}{}{}{}",
        CREATE_ACTIVITIES_TABLE,
        CREATE_ACTIVITY_VISITS_TABLE,
        CREATE_STUDY_APPS_TABLE,
        CREATE_BROWSERS_TABLE,
        CREATE_STUDY_WEBSITES_TABLE,
        CREATE_SOCIAL_WEBSITES_TABLE,
        CREATE_ENTERTAINMENT_WEBSITES_TABLE,
        CREATE_YOUTUBE_STUDY_KEYWORDS_TABLE,
        CREATE_YOUTUBE_ENTERTAINMENT_KEYWORDS_TABLE,
        CREATE_TERMINAL_KEYWORDS_TABLE,
        CREATE_CODING_APPS_TABLE,
        CREATE_ENTERTAINMENT_APPS_TABLE,
        CREATE_IGNORED_APPS_TABLE
    );

    conn.execute_batch(&create_schemas)?;

    // Seed tables if empty
    seed_table_if_empty(&conn, "coding_apps", CODING_APPS)?;
    seed_table_if_empty(&conn, "study_apps", STUDY_APPS)?;
    seed_table_if_empty(&conn, "browsers", BROWSERS)?;
    seed_table_if_empty(&conn, "study_websites", STUDY_WEBSITES)?;
    seed_table_if_empty(&conn, "social_websites", SOCIAL_WEBSITES)?;
    seed_table_if_empty(&conn, "entertainment_websites", ENTERTAINMENT_WEBSITES)?;
    seed_table_if_empty(&conn, "youtube_study_keywords", YOUTUBE_STUDY_KEYWORDS)?;
    seed_table_if_empty(&conn, "youtube_entertainment_keywords", YOUTUBE_ENTERTAINMENT_KEYWORDS)?;
    seed_table_if_empty(&conn, "terminal_keywords", TERMINAL_KEYWORDS)?;
    seed_table_if_empty(&conn, "entertainment_apps", ENTERTAINMENT_APPS)?;
    seed_table_if_empty(&conn, "ignored_apps", IGNORED_APPS)?;


    Ok(conn)
}

fn seed_table_if_empty(conn: &Connection, table_name: &str, defaults: &[&str]) -> Result<()> {
    let count: i64 = conn.query_row(
        &format!("SELECT COUNT(*) FROM {}", table_name),
        [],
        |row| row.get(0),
    )?;

    if count == 0 {
        let query = format!("INSERT OR IGNORE INTO {} (value) VALUES (?)", table_name);
        let mut stmt = conn.prepare(&query)?;
        for val in defaults {
            stmt.execute([val])?;
        }
    }
    Ok(())
}