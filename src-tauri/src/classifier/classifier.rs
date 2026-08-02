use super::keywords::*;

pub fn classify(title: &str) -> String {
    let title = title.to_lowercase();

    // Coding
    if title.contains("visual studio code")
        || title.contains("cursor")
        || title.contains("intellij")
    {
        return "Coding".to_string();
    }

    // Study websites
    for site in STUDY_WEBSITES {
        if title.contains(site) {
            return "Study".to_string();
        }
    }

    // Social websites
    for site in SOCIAL_WEBSITES {
        if title.contains(site) {
            return "Social".to_string();
        }
    }

    // Entertainment websites
    for site in ENTERTAINMENT_WEBSITES {
        if title.contains(site) {
            return "Entertainment".to_string();
        }
    }

    for terminal in TERMINAL_KEYWORDS {
    if title.contains(terminal) {
        return "Study".to_string();
    }
}

    // YouTube
    if title.contains("youtube") {
        for keyword in YOUTUBE_STUDY_KEYWORDS {
            if title.contains(keyword) {
                return "Study".to_string();
            }
        }

        return "Entertainment".to_string();
    }

    "Other".to_string()
}