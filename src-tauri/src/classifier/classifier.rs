use super::keywords::*;

pub fn is_study_app(process_name: &str) -> bool {
    STUDY_APPS
        .iter()
        .any(|app| app.eq_ignore_ascii_case(process_name))
}