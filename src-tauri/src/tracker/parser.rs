#[derive(Debug, Clone)]
pub struct ParsedWindow {
    pub application: String,
    pub website: Option<String>,
    pub title: String,
    pub activity_key: String,
}

pub fn parse_window(window: &str, process_name: &str) -> ParsedWindow {

    // ---------------- Browser ----------------

    if window.ends_with(" - Google Chrome") {

        let text = window.replace(" - Google Chrome", "");

        return parse_browser(text, "Google Chrome".to_string());
    }

    if window.ends_with(" - Brave") {

        let text = window.replace(" - Brave", "");

        return parse_browser(text, "Brave".to_string());
    }

    if window.ends_with(" - Microsoft Edge") {

        let text = window.replace(" - Microsoft Edge", "");

        return parse_browser(text, "Microsoft Edge".to_string());
    }

    // ---------------- VS Code ----------------

    if window.ends_with(" - Visual Studio Code") {

        let title = window.replace(" - Visual Studio Code", "");

        return ParsedWindow {

            application: "Visual Studio Code".to_string(),

            website: None,

            activity_key: generate_activity_key(
                "Visual Studio Code",
                None,
                &title,
            ),

            title,
        };
    }

    // ---------------- Default ----------------

    let app_name = if process_name.is_empty() || process_name == "Unknown" {
        "Unknown".to_string()
    } else {
        process_name.to_string()
    };

    ParsedWindow {

        application: app_name.clone(),

        website: None,

        activity_key: generate_activity_key(
            &app_name,
            None,
            window,
        ),

        title: window.to_string(),
    }
}

fn parse_browser(
    text: String,
    application: String,
) -> ParsedWindow {

    let parts: Vec<&str> = text.split(" - ").collect();

    if parts.len() >= 2 {

        let website = parts.last().unwrap().to_string();

        let title = parts[..parts.len()-1].join(" - ");

        return ParsedWindow {

            activity_key: generate_activity_key(
                &application,
                Some(&website),
                &title,
            ),

            application,

            website: Some(website),

            title,
        };
    }

    ParsedWindow {

        activity_key: generate_activity_key(
            &application,
            None,
            &text,
        ),

        application,

        website: None,

        title: text,
    }
}

fn generate_activity_key(
    application: &str,
    website: Option<&str>,
    title: &str,
) -> String {

    let mut key = String::new();

    if let Some(site) = website {

        key.push_str(site);
        key.push('_');
    }

    key.push_str(application);

    key.push('_');

    key.push_str(title);

    key
        .to_lowercase()
        .replace(|c: char| !c.is_alphanumeric(), "_")
}