use rusqlite::{Connection, Result};
use std::time::Duration;

pub fn get_connection() -> Result<Connection> {
    let conn = Connection::open("activity_tracker.db")?;

    // Wait up to 5 seconds if the database is busy
    conn.busy_timeout(Duration::from_secs(5))?;

    // Enable WAL mode (better concurrency)
    conn.pragma_update(None, "journal_mode", "WAL")?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS activities(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            day_key TEXT NOT NULL,

            activity_key TEXT NOT NULL,

            title TEXT NOT NULL,

            application TEXT,

            website TEXT,

            category TEXT,

            total_duration INTEGER DEFAULT 0,

            visit_count INTEGER DEFAULT 0,

            UNIQUE(day_key, activity_key)
        );

        CREATE TABLE IF NOT EXISTS activity_visits(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            activity_id INTEGER NOT NULL,

            start_time TEXT NOT NULL,

            end_time TEXT NOT NULL,

            duration INTEGER NOT NULL,

            FOREIGN KEY(activity_id)
            REFERENCES activities(id)
        );
        ",
    )?;

    Ok(conn)
}