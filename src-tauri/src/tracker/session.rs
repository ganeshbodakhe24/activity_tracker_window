use std::time::SystemTime;

#[derive(Debug, Clone)]
pub struct Session {
    pub window_title: String,
    pub category: String,

    pub start_time: SystemTime,
    pub end_time: Option<SystemTime>,

    pub duration_seconds: u64,
}