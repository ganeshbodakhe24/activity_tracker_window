use chrono::{Duration, Local, NaiveDate, Datelike};
use std::sync::atomic::Ordering;
use tauri::{
    menu::{MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

pub mod tracker;
pub mod classifier;
pub mod database;

// Helper to calculate date ranges for dashboard views
fn get_date_range(range_type: &str, offset: i32) -> (NaiveDate, NaiveDate) {
    let now = Local::now().date_naive();
    match range_type {
        "Today" => {
            let target = now + Duration::days(offset as i64);
            (target, target)
        }
        "This Week" => {
            let weekday = now.weekday();
            let days_from_monday = weekday.num_days_from_monday() as i64;
            let monday = now - Duration::days(days_from_monday) + Duration::weeks(offset as i64);
            let sunday = monday + Duration::days(6);
            (monday, sunday)
        }
        "Last 7 Days" => {
            let end = now + Duration::days(offset as i64 * 7);
            let start = end - Duration::days(6);
            (start, end)
        }
        "This Month" => {
            let end = now;
            let start = end - Duration::days(30);
            (start, end)
        }
        _ => {
            let weekday = now.weekday();
            let days_from_monday = weekday.num_days_from_monday() as i64;
            let monday = now - Duration::days(days_from_monday) + Duration::weeks(offset as i64);
            let sunday = monday + Duration::days(6);
            (monday, sunday)
        }
    }
}

// Allowed table validation for security
fn validate_table_name(table: &str) -> Result<(), String> {
    let allowed = [
        "browsers", "coding_apps", "study_apps", "study_websites",
        "social_websites", "entertainment_websites",
        "youtube_study_keywords", "youtube_entertainment_keywords",
        "terminal_keywords", "ignored_apps", "entertainment_apps"
    ];
    if allowed.contains(&table) {
        Ok(())
    } else {
        Err("Table not allowed".to_string())
    }
}

#[tauri::command]
fn is_tracking() -> bool {
    tracker::manager::IS_TRACKING.load(Ordering::Relaxed)
}

#[tauri::command]
fn set_tracking_status(active: bool) {
    tracker::manager::IS_TRACKING.store(active, Ordering::Relaxed);
}

#[tauri::command]
fn get_weekly_summary(range_type: String, offset: i32) -> Vec<serde_json::Value> {
    let (start, end) = get_date_range(&range_type, offset);
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    
    let mut result = Vec::new();
    let mut current = start;
    
    let mut cat_stmt = conn.prepare(
        "SELECT category, COALESCE(SUM(total_duration), 0) as dur 
         FROM activities 
         WHERE day_key = ? 
         GROUP BY category 
         ORDER BY dur DESC"
    ).unwrap();

    while current <= end {
        let date_str = current.format("%Y-%m-%d").to_string();
        let day_name = current.format("%a").to_string();
        
        let cat_rows = cat_stmt.query_map([&date_str], |row| {
            Ok(serde_json::json!({
                "category": row.get::<_, String>(0)?,
                "duration": row.get::<_, i64>(1)?
            }))
        }).unwrap();
        let categories: Vec<serde_json::Value> = cat_rows.filter_map(Result::ok).collect();
        
        let total_day_dur: i64 = categories.iter()
            .map(|c| c["duration"].as_i64().unwrap_or(0))
            .sum();
        
        result.push(serde_json::json!({
            "day_name": day_name,
            "date_str": date_str,
            "duration": total_day_dur,
            "categories": categories
        }));
        
        current += Duration::days(1);
    }
    result
}

#[tauri::command]
fn get_range_aggregates(range_type: String, offset: i32) -> serde_json::Value {
    let (start, end) = get_date_range(&range_type, offset);
    let start_str = start.format("%Y-%m-%d").to_string();
    let end_str = end.format("%Y-%m-%d").to_string();
    
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    
    let visit_count: i64 = conn.query_row(
        "SELECT COALESCE(SUM(visit_count), 0) FROM activities WHERE day_key BETWEEN ? AND ?",
        [&start_str, &end_str],
        |row| row.get(0),
    ).unwrap_or(0);
    
    let top_app: String = conn.query_row(
        "SELECT application FROM activities WHERE day_key BETWEEN ? AND ? GROUP BY application ORDER BY SUM(total_duration) DESC LIMIT 1",
        [&start_str, &end_str],
        |row| row.get(0),
    ).unwrap_or_else(|_| "—".to_string());

    let top_category: String = conn.query_row(
        "SELECT category FROM activities WHERE day_key BETWEEN ? AND ? GROUP BY category ORDER BY SUM(total_duration) DESC LIMIT 1",
        [&start_str, &end_str],
        |row| row.get(0),
    ).unwrap_or_else(|_| "—".to_string());
    
    serde_json::json!({
        "visit_count": visit_count,
        "top_app": top_app,
        "top_category": top_category
    })
}

#[tauri::command]
fn get_app_usage(date: String) -> Vec<serde_json::Value> {
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    let mut stmt = conn.prepare(
        "SELECT application, SUM(total_duration) as dur FROM activities WHERE day_key = ? GROUP BY application ORDER BY dur DESC LIMIT 10"
    ).unwrap();
    let rows = stmt.query_map([&date], |row| {
        Ok(serde_json::json!({
            "application": row.get::<_, String>(0)?,
            "duration": row.get::<_, i64>(1)?
        }))
    }).unwrap();
    rows.filter_map(Result::ok).collect()
}

#[tauri::command]
fn get_category_usage(date: String) -> Vec<serde_json::Value> {
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    let mut stmt = conn.prepare(
        "SELECT category, SUM(total_duration) as dur FROM activities WHERE day_key = ? GROUP BY category ORDER BY dur DESC"
    ).unwrap();
    let rows = stmt.query_map([&date], |row| {
        Ok(serde_json::json!({
            "category": row.get::<_, String>(0)?,
            "duration": row.get::<_, i64>(1)?
        }))
    }).unwrap();
    rows.filter_map(Result::ok).collect()
}

#[tauri::command]
fn get_website_usage(date: String) -> Vec<serde_json::Value> {
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    let mut stmt = conn.prepare(
        "SELECT website, SUM(total_duration) as dur FROM activities WHERE day_key = ? AND website != '' GROUP BY website ORDER BY dur DESC LIMIT 10"
    ).unwrap();
    let rows = stmt.query_map([&date], |row| {
        Ok(serde_json::json!({
            "website": row.get::<_, String>(0)?,
            "duration": row.get::<_, i64>(1)?
        }))
    }).unwrap();
    rows.filter_map(Result::ok).collect()
}

#[tauri::command]
fn get_timeline(date: String, page: i64, limit: i64) -> serde_json::Value {
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    let offset = (page - 1) * limit;
    
    let mut stmt = conn.prepare(
        "SELECT v.id, a.application, a.website, a.title, a.category, v.start_time, v.end_time, v.duration 
         FROM activity_visits v 
         JOIN activities a ON v.activity_id = a.id 
         WHERE a.day_key = ? 
         ORDER BY v.start_time DESC 
         LIMIT ? OFFSET ?"
    ).unwrap();
    
    let rows = stmt.query_map([&date, &limit.to_string(), &offset.to_string()], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "application": row.get::<_, String>(1)?,
            "website": row.get::<_, String>(2)?,
            "title": row.get::<_, String>(3)?,
            "category": row.get::<_, String>(4)?,
            "start_time": row.get::<_, String>(5)?,
            "end_time": row.get::<_, String>(6)?,
            "duration": row.get::<_, i64>(7)?
        }))
    }).unwrap();
    
    let visits: Vec<serde_json::Value> = rows.filter_map(Result::ok).collect();
    let has_more = visits.len() == limit as usize;
    
    serde_json::json!({
        "visits": visits,
        "has_more": has_more
    })
}
#[tauri::command]
fn add_classification_rule_and_update_week(
    table_name: String,
    value: String,
    category: String,
    date_str: String,
) -> Result<(), String> {
    let mut conn = database::sqlite::get_connection().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 1. Insert rule into reference table
    tx.execute(
        &format!("INSERT OR IGNORE INTO {} (value) VALUES (?)", table_name),
        rusqlite::params![value],
    ).map_err(|e| e.to_string())?;

    // 2. Calculate Sunday and Saturday dates for the week of date_str
    let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
        .map_err(|e| e.to_string())?;
    
    let offset_from_sunday = date.weekday().num_days_from_sunday() as i64;
    let sunday = date - Duration::days(offset_from_sunday);
    let saturday = sunday + Duration::days(6);

    let sun_str = sunday.format("%Y-%m-%d").to_string();
    let sat_str = saturday.format("%Y-%m-%d").to_string();

    // 3. Update activities table
    if table_name == "coding_apps" || table_name == "study_apps" {
        tx.execute(
            "UPDATE activities 
             SET category = ? 
             WHERE (application = ? OR application LIKE ?) 
               AND category = 'Other' 
               AND day_key BETWEEN ? AND ?",
            rusqlite::params![
                category,
                value,
                format!("%{}%", value),
                sun_str,
                sat_str
            ],
        ).map_err(|e| e.to_string())?;
    } else if table_name == "study_websites" || table_name == "social_websites" || table_name == "entertainment_websites" {
        tx.execute(
            "UPDATE activities 
             SET category = ? 
             WHERE (website = ? OR website LIKE ?) 
               AND category = 'Other' 
               AND day_key BETWEEN ? AND ?",
            rusqlite::params![
                category,
                value,
                format!("%{}%", value),
                sun_str,
                sat_str
            ],
        ).map_err(|e| e.to_string())?;
    } else {
        tx.execute(
            "UPDATE activities 
             SET category = ? 
             WHERE title LIKE ? 
               AND category = 'Other' 
               AND day_key BETWEEN ? AND ?",
            rusqlite::params![
                category,
                format!("%{}%", value),
                sun_str,
                sat_str
            ],
        ).map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_today_timeline_strip(date: String) -> Vec<serde_json::Value> {
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    let mut stmt = conn.prepare(
        "SELECT v.start_time, v.end_time, v.duration, a.category 
         FROM activity_visits v 
         JOIN activities a ON v.activity_id = a.id 
         WHERE a.day_key = ? 
         ORDER BY v.start_time ASC"
    ).unwrap();
    
    let rows = stmt.query_map([&date], |row| {
        Ok(serde_json::json!({
            "start_time": row.get::<_, String>(0)?,
            "end_time": row.get::<_, String>(1)?,
            "duration": row.get::<_, i64>(2)?,
            "category": row.get::<_, String>(3)?
        }))
    }).unwrap();
    rows.filter_map(Result::ok).collect()
}

#[tauri::command]
fn get_activities(date: String, search: String, category: String, page: i64, limit: i64) -> serde_json::Value {
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    let offset = (page - 1) * limit;
    
    let mut query = "SELECT id, day_key, activity_key, title, application, website, category, total_duration, visit_count 
                     FROM activities 
                     WHERE day_key = ?".to_string();
    let mut params: Vec<String> = vec![date];
    
    if !search.is_empty() {
        query.push_str(" AND (title LIKE ? OR application LIKE ? OR website LIKE ?)");
        let search_pattern = format!("%{}%", search);
        params.push(search_pattern.clone());
        params.push(search_pattern.clone());
        params.push(search_pattern.clone());
    }
    
    if category != "All" {
        query.push_str(" AND category = ?");
        params.push(category);
    }
    
    query.push_str(" ORDER BY total_duration DESC LIMIT ? OFFSET ?");
    params.push(limit.to_string());
    params.push(offset.to_string());
    
    let mut stmt = conn.prepare(&query).unwrap();
    let param_refs: Vec<&str> = params.iter().map(|s| s.as_str()).collect();
    
    let rows = stmt.query_map(rusqlite::params_from_iter(param_refs), |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "day_key": row.get::<_, String>(1)?,
            "activity_key": row.get::<_, String>(2)?,
            "title": row.get::<_, String>(3)?,
            "application": row.get::<_, String>(4)?,
            "website": row.get::<_, String>(5)?,
            "category": row.get::<_, String>(6)?,
            "total_duration": row.get::<_, i64>(7)?,
            "visit_count": row.get::<_, i64>(8)?
        }))
    }).unwrap();
    
    let activities: Vec<serde_json::Value> = rows.filter_map(Result::ok).collect();
    let has_more = activities.len() == limit as usize;
    
    serde_json::json!({
        "activities": activities,
        "has_more": has_more
    })
}

#[tauri::command]
fn get_activity_visits(activity_id: i64) -> Vec<serde_json::Value> {
    let conn = database::sqlite::get_connection().expect("Database connection failed");
    let mut stmt = conn.prepare(
        "SELECT id, start_time, end_time, duration FROM activity_visits WHERE activity_id = ? ORDER BY start_time DESC"
    ).unwrap();
    let rows = stmt.query_map([activity_id], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "start_time": row.get::<_, String>(1)?,
            "end_time": row.get::<_, String>(2)?,
            "duration": row.get::<_, i64>(3)?
        }))
    }).unwrap();
    rows.filter_map(Result::ok).collect()
}

#[tauri::command]
fn get_table_data(table: String, search: String) -> Result<Vec<serde_json::Value>, String> {
    validate_table_name(&table)?;
    let conn = database::sqlite::get_connection().map_err(|e| e.to_string())?;
    
    let query = if search.is_empty() {
        format!("SELECT id, value FROM {} ORDER BY value ASC", table)
    } else {
        format!("SELECT id, value FROM {} WHERE value LIKE ? ORDER BY value ASC", table)
    };
    
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let mapper = |row: &rusqlite::Row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "value": row.get::<_, String>(1)?
        }))
    };

    let rows = if search.is_empty() {
        stmt.query_map([], mapper)
    } else {
        stmt.query_map([format!("%{}%", search)], mapper)
    }.map_err(|e| e.to_string())?;
    
    Ok(rows.filter_map(Result::ok).collect())
}

#[tauri::command]
fn insert_table_record(table: String, value: String) -> Result<(), String> {
    validate_table_name(&table)?;
    let conn = database::sqlite::get_connection().map_err(|e| e.to_string())?;
    
    let query = format!("INSERT INTO {} (value) VALUES (?)", table);
    conn.execute(&query, [value]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn update_table_record(table: String, id: i64, value: String) -> Result<(), String> {
    validate_table_name(&table)?;
    let conn = database::sqlite::get_connection().map_err(|e| e.to_string())?;
    
    let query = format!("UPDATE {} SET value = ? WHERE id = ?", table);
    conn.execute(&query, rusqlite::params![value, id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_table_record(table: String, id: i64) -> Result<(), String> {
    validate_table_name(&table)?;
    let conn = database::sqlite::get_connection().map_err(|e| e.to_string())?;
    
    let query = format!("DELETE FROM {} WHERE id = ?", table);
    conn.execute(&query, [id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn export_data(format: String, from: String, to: String) -> Result<String, String> {
    let conn = database::sqlite::get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT a.day_key, a.application, a.website, a.title, a.category, v.start_time, v.end_time, v.duration 
         FROM activity_visits v 
         JOIN activities a ON v.activity_id = a.id 
         WHERE a.day_key BETWEEN ? AND ? 
         ORDER BY v.start_time ASC"
    ).map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([&from, &to], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, String>(5)?,
            row.get::<_, String>(6)?,
            row.get::<_, i64>(7)?
        ))
    }).map_err(|e| e.to_string())?;
    
    let data: Vec<_> = rows.filter_map(Result::ok).collect();
    
    let home = std::env::var("USERPROFILE")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());
        
    let filename = format!("activity_export_{}_{}.{}", from, to, format.to_lowercase());
    let export_path = home.join(filename);
    
    if format == "CSV" {
        let mut csv_content = "Day,Application,Website,Title,Category,Start Time,End Time,Duration (sec)\n".to_string();
        for row in data {
            let escaped_title = row.3.replace("\"", "\"\"");
            let escaped_app = row.1.replace("\"", "\"\"");
            csv_content.push_str(&format!(
                "{},\"{}\",\"{}\",\"{}\",\"{}\",{},{},{}\n",
                row.0, escaped_app, row.2, escaped_title, row.4, row.5, row.6, row.7
            ));
        }
        std::fs::write(&export_path, csv_content).map_err(|e| e.to_string())?;
    } else {
        let mut json_rows = Vec::new();
        for row in data {
            json_rows.push(serde_json::json!({
                "day": row.0,
                "application": row.1,
                "website": row.2,
                "title": row.3,
                "category": row.4,
                "start_time": row.5,
                "end_time": row.6,
                "duration": row.7
            }));
        }
        let file = std::fs::File::create(&export_path).map_err(|e| e.to_string())?;
        serde_json::to_writer_pretty(file, &json_rows).map_err(|e| e.to_string())?;
    }
    
    Ok(export_path.to_string_lossy().to_string())
}

#[tauri::command]
fn delete_activity_data(mode: String, from: String, to: String) -> Result<(), String> {
    let mut conn = database::sqlite::get_connection().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    
    if mode == "all" {
        tx.execute("DELETE FROM activities", []).map_err(|e| e.to_string())?;
    } else {
        tx.execute(
            "DELETE FROM activities WHERE day_key BETWEEN ? AND ?",
            [&from, &to]
        ).map_err(|e| e.to_string())?;
    }
    
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_settings() -> serde_json::Value {
    serde_json::json!({
        "autostart": false,
        "filter_active": true
    })
}

#[tauri::command]
fn set_autostart(enabled: bool) -> Result<(), String> {
    println!("Autostart updated: {}", enabled);
    Ok(())
}

#[tauri::command]
fn set_filter_active(enabled: bool) -> Result<(), String> {
    println!("Classifier filter status updated: {}", enabled);
    Ok(())
}

#[tauri::command]
fn trigger_manual_cleanup() -> Result<usize, String> {
    let conn = database::sqlite::get_connection().map_err(|e| e.to_string())?;

    let deleted_count = conn.execute(
        "DELETE FROM activity_visits",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(deleted_count)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;

            let menu = MenuBuilder::new(app)
                .item(&show_i)
                .item(&quit_i)
                .build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "quit" => {
                            app.exit(0);
                        }
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            is_tracking,
            set_tracking_status,
            get_weekly_summary,
            get_range_aggregates,
            get_app_usage,
            get_category_usage,
            get_website_usage,
            get_timeline,
            get_activities,
            get_activity_visits,
            get_table_data,
            insert_table_record,
            update_table_record,
            delete_table_record,
            export_data,
            delete_activity_data,
            get_settings,
            set_autostart,
            set_filter_active,
            trigger_manual_cleanup,
            get_today_timeline_strip,
            add_classification_rule_and_update_week
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
