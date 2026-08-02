// use crate::tracker::foreground::get_active_window_title;
// use std::{thread, time::Duration};

// pub fn start_tracker() {
//     println!("Activity Tracker Started...\n");

//     let mut previous_window = String::new();

//     loop {
//         if let Some(current_window) = get_active_window_title() {

//             // Ignore empty titles
//             if current_window.trim().is_empty() {
//                 thread::sleep(Duration::from_secs(2));
//                 continue;
//             }

//             // Print only when the window changes
//             if current_window != previous_window {
//                 println!("Active Window : {}", current_window);
//                 previous_window = current_window;
//             }
//         }

//         // Change this value to adjust how often the active window is checked.
//         thread::sleep(Duration::from_secs(2));
//     }
// }