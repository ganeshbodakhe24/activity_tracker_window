use rusqlite::{Connection, Result};
use std::time::Duration;
use crate::database::schema::*;
use crate::classifier::keywords::*;

pub fn get_connection() -> Result<Connection> {
    let conn = Connection::open("activity_tracker.db")?;

    // Wait up to 5 seconds if the database is busy
    conn.busy_timeout(Duration::from_secs(5))?;

    // Enable foreign keys
    conn.pragma_update(None, "foreign_keys", "ON")?;

    // Enable WAL mode (better concurrency)
    conn.pragma_update(None, "journal_mode", "WAL")?;

    let create_schemas = format!(
        "{}{}{}{}{}{}{}{}{}{}{}{}",
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
        CREATE_ENTERTAINMENT_APPS_TABLE
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