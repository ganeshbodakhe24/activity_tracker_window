use chrono::Local;

use crate::classifier::classifier::classify;
use crate::database::repository::save_session;
use crate::tracker::foreground::get_active_window_title;
use crate::tracker::parser::parse_window;
use crate::tracker::session::Session;

use std::{thread, time::Duration};

fn clean_window_title(title: &str) -> String {
    let lower = title.trim().to_lowercase();

    if lower.starts_with("npm ") || lower == "npm" {
        return "Command Prompt (npm)".to_string();
    }

    if lower.starts_with("cargo ") || lower == "cargo" {
        return "Command Prompt (cargo)".to_string();
    }

    if lower.starts_with("git ") || lower == "git" {
        return "Command Prompt (git)".to_string();
    }

    if lower.starts_with("java ") || lower == "java" {
        return "Command Prompt (java)".to_string();
    }

    if lower.starts_with("python ") || lower == "python" {
        return "Command Prompt (python)".to_string();
    }

    title.to_string()
}

pub fn start_tracker() {
    println!("Activity Tracker Started...\n");

    let mut current_session: Option<Session> = None;

    loop {
        if let Some(window) = get_active_window_title() {
            let cleaned = clean_window_title(&window);

            // Parse only once
            let parsed = parse_window(&cleaned);

            let category = classify(&cleaned);

            // Start a new session only if something actually changed
            let changed = match &current_session {
                Some(session) => {
                    session.application != parsed.application
                        || session.website != parsed.website
                        || session.title != parsed.title
                }
                None => true,
            };

            if changed {
                // End previous session
                if let Some(mut session) = current_session.take() {
                    session.end();

                    save_session(&session);

                    let duration = session.duration();

                    println!("\n======================================");
                    println!("SESSION ENDED");
                    println!("Application : {}", session.application);
                    println!("Website     : {:?}", session.website);
                    println!("Title       : {}", session.title);
                    println!("Category    : {}", session.category);
                    println!(
                        "Started At  : {}",
                        session.start_time.format("%H:%M:%S")
                    );
                    println!(
                        "Ended At    : {}",
                        session.end_time.unwrap().format("%H:%M:%S")
                    );
                    println!("Duration    : {} sec", duration.num_seconds());
                    println!("======================================");
                }

                // Start new session
                let session = Session::new(
                    parsed.application.clone(),
                    parsed.website.clone(),
                    parsed.title.clone(),
                    category.clone(),
                );

                println!("\n--------------------------------------");
                println!("SESSION STARTED");
                println!("Application : {}", parsed.application);
                println!("Website     : {:?}", parsed.website);
                println!("Title       : {}", parsed.title);
                println!("Category    : {}", category);
                println!(
                    "Started At  : {}",
                    Local::now().format("%H:%M:%S")
                );
                println!("--------------------------------------");

                current_session = Some(session);
            }
        }

        // Check every 2 seconds
        thread::sleep(Duration::from_secs(2));
    }
}