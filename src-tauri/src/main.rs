mod tracker;
mod classifier;

use chrono::Local;
use classifier::classifier::classify;
use tracker::foreground::get_active_window_title;
use tracker::session::Session;

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

fn main() {

    println!("Activity Tracker Started...\n");

    let mut current_session: Option<Session> = None;

    loop {

        if let Some(window) = get_active_window_title() {

            let cleaned = clean_window_title(&window);

            let category = classify(&cleaned);

            let changed = match &current_session {
                Some(session) => session.window_title != cleaned,
                None => true,
            };

            if changed {

                // End previous session
                if let Some(mut session) = current_session.take() {

                    session.end();

                    let duration = session.duration();

                    println!("\n======================================");
                    println!("SESSION ENDED");
                    println!("Window      : {}", session.window_title);
                    println!("Category    : {}", session.category);
                    println!("Started At  : {}", session.start_time.format("%H:%M:%S"));
                    println!(
                        "Ended At    : {}",
                        session.end_time.unwrap().format("%H:%M:%S")
                    );
                    println!("Duration    : {} sec", duration.num_seconds());
                    println!("======================================");
                }

                // Start new session
                let session = Session::new(cleaned.clone(), category.clone());

                println!("\n--------------------------------------");
                println!("SESSION STARTED");
                println!("Window      : {}", cleaned);
                println!("Category    : {}", category);
                println!(
                    "Started At  : {}",
                    Local::now().format("%H:%M:%S")
                );
                println!("--------------------------------------");

                current_session = Some(session);
            }
        }

        thread::sleep(Duration::from_secs(2));
    }
}