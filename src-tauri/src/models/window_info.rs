#[derive(Debug, Clone)]
pub struct WindowInfo {
    pub process_id: u32,
    pub process_name: String,
    pub window_title: String,
}