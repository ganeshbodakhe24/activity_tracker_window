# ⏱️ Activity Tracker

Activity Tracker is a modern, lightweight, privacy-focused desktop application built with **Tauri v2** and **React**. It runs silently in the background, automatically tracking active foreground application windows, categorizing activity types (Coding, Study, Entertainment, Social, etc.), and providing rich analytical dashboards.

---

## ✨ Features

- **Automated Foreground Window Tracking**: Automatically tracks the active application, window titles, and websites (extracted from browser titles) using Win32 API hooks.
- **Smart Categorization**: Classifies activities dynamically into categories such as `Coding`, `Study`, `Entertainment`, `Social`, and `Other` based on window title matching rules.
- **Power State & Lock Detection**: Listens to OS power events (like screen turning off or PC locking) using Windows power setting notifications to automatically pause tracking and save active sessions.
- **Ignore Lists**: Specify applications (e.g., password managers or locked screens) that should be excluded from active tracking logs.
- **Rich Analytics Dashboard**:
  - Daily summaries (Active Time, Visit Counts, Top App, Top Category).
  - 24-hour visual horizontal timeline showing activity blocks throughout the day.
  - Weekly stacked bar charts showing historical time spent per category.
  - Interactive donut chart for category breakdowns.
- **Timeline & Activity Log**: Chronological view of every session visit with pagination, search filters, and manual category re-classification.
- **Data Export & Retention**:
  - Export logs in **CSV** or **JSON** format to your local User Profile directory.
  - Periodic auto-cleanup of detailed session logs on Sundays.
  - Manual database cleanup triggers.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (with TypeScript)
- **Bundler**: Vite
- **Icons**: Lucide React
- **Charts**: Custom CSS/SVG rendering for performance and aesthetic control

### Backend (Tauri App)
- **Runtime**: Tauri v2
- **Language**: Rust
- **Database**: SQLite (via `rusqlite` with bundled SQLite driver)
- **OS Integrations**: Win32 API (via the `windows` crate) for foreground window capture and screen state monitoring.

---

## 📁 Project Structure

```text
├── src/                          # Frontend React Application
│   ├── assets/                   # App images, logos, and icons
│   ├── components/               # Reusable React components (e.g., SplashScreen)
│   ├── pages/                    # App Views (Dashboard, Timeline, Activities, DataManagement, Settings)
│   ├── App.tsx                   # Main layout, sidebar navigation, and Tauri event listener
│   ├── index.css                 # Global styling & custom themes
│   ├── main.tsx                  # React DOM mount point
│   └── styles.css                # Supplemental layout styles
├── src-tauri/                    # Backend Tauri/Rust Application
│   ├── capabilities/             # Tauri application security permissions
│   ├── icons/                    # Platform-specific build icons (.ico, .icns, PNGs)
│   ├── src/
│   │   ├── classifier/           # Classifier rules engine
│   │   ├── database/             # SQLite connection, schema migrations, and cleanups
│   │   ├── tracker/              # Active window listeners, Win32 handles, and session managers
│   │   ├── lib.rs                # Tauri command declarations & app bootstrap entry point
│   │   └── main.rs               # Rust executable main function
│   ├── Cargo.toml                # Rust dependencies configuration
│   └── tauri.conf.json           # Tauri build and bundle configuration
├── index.html                    # Vite entry HTML
└── package.json                  # Node.js scripts and dev dependencies
```

---

## 💾 Database Schema

The app stores data locally in an SQLite database file (`activity_tracker.db`) in the root workspace directory.

### Core Tables
1. **`activities`**: Summarizes duration and visit metrics for individual activities per day.
   - Columns: `id`, `day_key` (YYYY-MM-DD), `activity_key`, `title`, `application`, `website`, `category`, `total_duration` (seconds), `visit_count`.
2. **`activity_visits`**: Logs precise timestamps for every window switch.
   - Columns: `id`, `activity_id` (foreign key), `start_time` (ISO 8601), `end_time` (ISO 8601), `duration` (seconds).

### Reference Tables (Rules Engine)
Used to automatically classify activities:
- `browsers` (List of browsers to extract website URLs from)
- `coding_apps` / `entertainment_apps` / `study_apps`
- `study_websites` / `social_websites` / `entertainment_websites`
- `terminal_keywords` / `youtube_study_keywords` / `youtube_entertainment_keywords`
- `ignored_apps` (Processes completely ignored from tracking)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
1. **Node.js** (v18+)
2. **Rust** and **Cargo** compiler toolchain
3. **C++ Build Tools** (for compiling native Tauri bundles on Windows)

### Setup & Installation

1. Clone the repository and navigate to the project root directory.
2. Install node dependencies:
   ```bash
   npm install
   ```

### Development Mode

Run the following command to launch the app in Tauri development mode:
```bash
npm run tauri dev
```
This starts the Vite server, compiles the Rust backend, and launches the Tauri desktop window.

### Production Build

To build the release installer package (creates `.msi` and standalone executables on Windows):
```bash
npm run tauri build
```

---

## 🎨 Changing Application Icons

If you wish to change the Tauri application desktop/taskbar icons using a custom PNG:
1. Place your source image in `src/assets/appimg.png` (ideally a 1024x1024 transparent PNG).
2. Generate all the platform icon sizes:
   ```bash
   npm run tauri icon src/assets/appimg.png
   ```
3. Close any active instances of the app so the compilation cache is not locked.
4. Clean and rebuild the project to apply the changes:
   ```bash
   cd src-tauri
   cargo clean
   cd ..
   npm run tauri dev
   ```

---

## 🔒 Privacy & Safety

All tracked logs, window titles, and analytics are stored **100% locally** in the SQLite database (`activity_tracker.db`) on your disk. No data is transmitted to external servers or cloud services.
