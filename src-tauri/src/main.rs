mod tracker;

use tracker::foreground::get_active_window_title;

use std::{
    thread,
    time::Duration,
};

fn main() {

    println!("Activity Tracker Started...\n");

    // Stores the last active window.
    // We only print when the window changes.
    let mut previous_window = String::new();

    loop {

        if let Some(current_window) = get_active_window_title() {

            // Ignore windows with empty titles.
            if current_window.trim().is_empty() {
                thread::sleep(Duration::from_secs(10));
                continue;
            }

            // Ignore very long command windows.
            // Later we'll replace this with process-name filtering.
            if current_window.contains("npm list")
                || current_window.contains("cargo")
            {
                thread::sleep(Duration::from_secs(10));
                continue;
            }

            // Print only if the active window changed.
            if current_window != previous_window {

                println!("Active Window : {}", current_window);

                previous_window = current_window;
            }
        }

       
        // 10 = check every 10 seconds
        thread::sleep(Duration::from_secs(2));
    }
}