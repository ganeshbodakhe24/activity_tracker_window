use chrono::{DateTime, Duration, Local};

#[derive(Debug, Clone)]
pub struct Session {
    pub application: String,
    pub website: Option<String>,
    pub title: String,
    pub category: String,
    pub activity_key: String,

    pub start_time: DateTime<Local>,
    pub end_time: Option<DateTime<Local>>,
}

impl Session {
    pub fn new(
        application: String,
        website: Option<String>,
        title: String,
        category: String,
        activity_key: String,
    ) -> Self {
        Self {
            application,
            website,
            title,
            category,
            activity_key,
            start_time: Local::now(),
            end_time: None,
        }
    }

    pub fn end(&mut self) {
        self.end_time = Some(Local::now());
    }

    pub fn duration(&self) -> Duration {
        match self.end_time {
            Some(end) => end - self.start_time,
            None => Local::now() - self.start_time,
        }
    }
}