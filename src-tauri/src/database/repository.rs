use chrono::Datelike;
use rusqlite::params;

use crate::database::sqlite::get_connection;
use crate::tracker::session::Session;

pub fn save_session(session: &Session) {
    let mut conn = get_connection().expect("Failed to open database");
    
    let tx = conn.transaction().expect("Failed to start database transaction");

    // Example: 2026-08-15
    let day_key = format!(
        "{:04}-{:02}-{:02}",
        session.start_time.year(),
        session.start_time.month(),
        session.start_time.day()
    );

    let website = session.website.clone().unwrap_or_default();
    let activity_key = &session.activity_key;

    // 1. Find or create the activity summary row
    tx.execute(
        "
        INSERT INTO activities
        (
            day_key,
            activity_key,
            application,
            website,
            title,
            category,
            total_duration,
            visit_count
        )
        VALUES
        (?, ?, ?, ?, ?, ?, 0, 0)
        ON CONFLICT(day_key, activity_key) DO NOTHING
        ",
        params![
            day_key,
            activity_key,
            session.application,
            website,
            session.title,
            session.category,
        ],
    )
    .expect("Failed to ensure activity summary exists");

    let activity_id: i64 = tx
        .query_row(
            "SELECT id FROM activities WHERE day_key = ? AND activity_key = ?",
            params![day_key, activity_key],
            |row| row.get(0),
        )
        .expect("Failed to retrieve activity ID");

    // 2. Insert the detailed session visit
    let end_time = session.end_time.unwrap_or_else(chrono::Local::now);
    let duration_secs = session.duration().num_seconds();

    tx.execute(
        "
        INSERT INTO activity_visits
        (
            activity_id,
            start_time,
            end_time,
            duration
        )
        VALUES
        (?, ?, ?, ?)
        ",
        params![
            activity_id,
            session.start_time.to_rfc3339(),
            end_time.to_rfc3339(),
            duration_secs
        ],
    )
    .expect("Failed to insert detailed activity visit");

    // 3. Update summary metrics
    tx.execute(
        "
        UPDATE activities
        SET total_duration = total_duration + ?,
            visit_count = visit_count + 1
        WHERE id = ?
        ",
        params![duration_secs, activity_id],
    )
    .expect("Failed to update activity summary metrics");

    tx.commit().expect("Transaction commit failed");

    println!("Activity Session Saved Transactionally");
}

fn load_keywords_from_table(table_name: &str) -> Vec<String> {
    let conn = get_connection().expect("Failed to open database");
    let mut stmt = conn
        .prepare(&format!("SELECT value FROM {}", table_name))
        .expect("Failed to prepare statement");
    let rows = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .expect("Failed to query keywords");
    rows.filter_map(Result::ok).collect()
}

pub fn get_study_apps() -> Vec<String> {
    load_keywords_from_table("study_apps")
}

pub fn get_browsers() -> Vec<String> {
    load_keywords_from_table("browsers")
}

pub fn get_study_websites() -> Vec<String> {
    load_keywords_from_table("study_websites")
}

pub fn get_social_websites() -> Vec<String> {
    load_keywords_from_table("social_websites")
}

pub fn get_entertainment_websites() -> Vec<String> {
    load_keywords_from_table("entertainment_websites")
}

pub fn get_youtube_study_keywords() -> Vec<String> {
    load_keywords_from_table("youtube_study_keywords")
}

pub fn get_youtube_entertainment_keywords() -> Vec<String> {
    load_keywords_from_table("youtube_entertainment_keywords")
}

pub fn get_terminal_keywords() -> Vec<String> {
    load_keywords_from_table("terminal_keywords")
}

pub fn get_coding_apps() -> Vec<String> {
    load_keywords_from_table("coding_apps")
}

pub fn get_entertainment_apps() -> Vec<String> {
    load_keywords_from_table("entertainment_apps")
}

pub fn get_ignored_apps() -> Vec<String> {
    load_keywords_from_table("ignored_apps")
}