mod tracker;
mod classifier;
mod database;

fn main() {
    // Spawn background activity tracking thread
    std::thread::spawn(|| {
        tracker::manager::start_tracker();
    });

    // Run tauri frontend window loop
    activity_tracker_lib::run();
}