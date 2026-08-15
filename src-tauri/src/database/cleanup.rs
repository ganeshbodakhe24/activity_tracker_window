use chrono::{Local, Weekday, Datelike};
use rusqlite::params;

use crate::database::sqlite::get_connection;

pub fn clean_old_visits_if_sunday() {
    let now = Local::now();
    if now.weekday() == Weekday::Sun {
        let conn = get_connection().expect("Failed to open database");
        // Sunday 00:00:00 of the current day
        let today_start = now.date_naive().and_hms_opt(0, 0, 0).unwrap().and_local_timezone(Local).unwrap();
        let today_start_rfc = today_start.to_rfc3339();

        let deleted_count = conn.execute(
            "DELETE FROM activity_visits WHERE start_time < ?",
            params![today_start_rfc],
        )
        .expect("Failed to clean up old detailed activity visits on Sunday");

        if deleted_count > 0 {
            println!("Sunday Cleanup: Deleted {} old detailed activity visits.", deleted_count);
        }
    }
}
