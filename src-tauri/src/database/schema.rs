pub const CREATE_ACTIVITIES_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_key TEXT NOT NULL,
        activity_key TEXT NOT NULL,
        title TEXT NOT NULL,
        application TEXT,
        website TEXT,
        category TEXT,
        total_duration INTEGER DEFAULT 0,
        visit_count INTEGER DEFAULT 0,
        UNIQUE(day_key, activity_key)
    );
";

pub const CREATE_ACTIVITY_VISITS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS activity_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        FOREIGN KEY(activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE
    );
";

pub const CREATE_STUDY_APPS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS study_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_BROWSERS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS browsers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_STUDY_WEBSITES_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS study_websites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_SOCIAL_WEBSITES_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS social_websites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_ENTERTAINMENT_WEBSITES_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS entertainment_websites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_YOUTUBE_STUDY_KEYWORDS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS youtube_study_keywords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_YOUTUBE_ENTERTAINMENT_KEYWORDS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS youtube_entertainment_keywords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_TERMINAL_KEYWORDS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS terminal_keywords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_CODING_APPS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS coding_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";

pub const CREATE_ENTERTAINMENT_APPS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS entertainment_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL UNIQUE
    );
";
