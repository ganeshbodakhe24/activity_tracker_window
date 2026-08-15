#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Spawn background activity tracking thread using the shared library module
    std::thread::spawn(|| {
        activity_tracker_lib::tracker::manager::start_tracker();
    });

    // Run tauri frontend window loop
    activity_tracker_lib::run();
}