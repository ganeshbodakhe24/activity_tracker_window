use crate::database::repository;

pub fn classify(title: &str) -> String {
    let title = title.to_lowercase();

    // Coding
    let coding_apps = repository::get_coding_apps();
    for app in &coding_apps {
        if title.contains(app) {
            return "Coding".to_string();
        }
    }

    // Study websites
    let study_websites = repository::get_study_websites();
    for site in &study_websites {
        if title.contains(site) {
            return "Study".to_string();
        }
    }

    // Social websites
    let social_websites = repository::get_social_websites();
    for site in &social_websites {
        if title.contains(site) {
            return "Social".to_string();
        }
    }

    // Entertainment websites
    let entertainment_websites = repository::get_entertainment_websites();
    for site in &entertainment_websites {
        if title.contains(site) {
            return "Entertainment".to_string();
        }
    }

    let terminal_keywords = repository::get_terminal_keywords();
    for terminal in &terminal_keywords {
        if title.contains(terminal) {
            return "Study".to_string();
        }
    }

    // YouTube
    if title.contains("youtube") {
        let youtube_study_keywords = repository::get_youtube_study_keywords();
        for keyword in &youtube_study_keywords {
            if title.contains(keyword) {
                return "Study".to_string();
            }
        }

        return "Entertainment".to_string();
    }

    "Other".to_string()
}