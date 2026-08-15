use chrono::Datelike;
use rusqlite::params;

use crate::database::sqlite::get_connection;
use crate::tracker::session::Session;

pub fn save_session(session: &Session) {
    let conn = get_connection().expect("Failed to open database");

    // Example: 20260803
    let day_key = format!(
        "{:04}{:02}{:02}",
        session.start_time.year(),
        session.start_time.month(),
        session.start_time.day()
    );

    let website = session.website.clone().unwrap_or_default();

    conn.execute(
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
        (?, ?, ?, ?, ?, ?, ?, ?)
        ",
        params![
            day_key,
            format!(
                "{}_{}",
                website.to_lowercase(),
                session.title.to_lowercase()
            ),
            session.application,
            website,
            session.title,
            session.category,
            session.duration().num_seconds(),
            1
        ],
    )
    .expect("Insert failed");

    println!("Activity Saved");
}