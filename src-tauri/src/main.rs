mod tracker;
mod classifier;
use tracker::foreground::get_active_window_title;
use classifier::classifier::classify;

use std::{
    thread,
    time::Duration,
};

fn clean_window_title(title: &str) -> String {
    let lower = title.to_lowercase();

    // Command Prompt / PowerShell running npm
    if lower.contains("npm ") || lower.starts_with("npm") {
        return "Command Prompt (npm)".to_string();
    }

    // Cargo
    if lower.contains("cargo ") || lower.starts_with("cargo") {
        return "Command Prompt (cargo)".to_string();
    }

    title.to_string()
}

fn main() {

    println!("Activity Tracker Started...\n");

    let mut previous_window = String::new();

    loop {

        if let Some(current_window) = get_active_window_title() {

            if current_window.trim().is_empty() {
                thread::sleep(Duration::from_secs(2));
                continue;
            }

let cleaned = clean_window_title(&current_window);

if cleaned != previous_window {

    let category = classify(&cleaned);

    println!("------------------------------------");
    println!("Active Window : {}", cleaned);
    println!("Category      : {}", category);

    previous_window = cleaned;
}

        }

        thread::sleep(Duration::from_secs(2));
    }
}