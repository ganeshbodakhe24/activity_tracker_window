#[derive(Debug)]
pub struct Activity {

    pub id: i64,

    pub day_key: String,

    pub activity_key: String,

    pub title: String,

    pub application: String,

    pub website: String,

    pub category: String,

    pub total_duration: i64,

    pub visit_count: i64,
}