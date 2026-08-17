use chrono::Local;

use crate::classifier::classifier::classify;
use crate::database::repository::save_session;
use crate::database::cleanup::clean_old_visits_if_sunday;
use crate::tracker::foreground::get_active_window_info;
use crate::tracker::parser::parse_window;
use crate::tracker::session::Session;

use std::{thread, time::Duration};
use std::sync::{Arc, Mutex};

fn clean_window_title(title: &str) -> String {
    let lower = title.trim().to_lowercase();

    if lower.starts_with("npm ") || lower == "npm" {
        return "Command Prompt (npm)".to_string();
    }

    if lower.starts_with("cargo ") || lower == "cargo" {
        return "Command Prompt (cargo)".to_string();
    }

    if lower.starts_with("git ") || lower == "git" {
        return "Command Prompt (git)".to_string();
    }

    if lower.starts_with("java ") || lower == "java" {
        return "Command Prompt (java)".to_string();
    }

    if lower.starts_with("python ") || lower == "python" {
        return "Command Prompt (python)".to_string();
    }

    title.to_string()
}

use std::sync::atomic::{AtomicBool, Ordering};

pub static IS_TRACKING: AtomicBool = AtomicBool::new(true);
pub static IS_SCREEN_ON: AtomicBool = AtomicBool::new(true);

unsafe extern "system" fn power_wnd_proc(
    hwnd: windows::Win32::Foundation::HWND,
    msg: u32,
    wparam: windows::Win32::Foundation::WPARAM,
    lparam: windows::Win32::Foundation::LPARAM,
) -> windows::Win32::Foundation::LRESULT {
    use windows::Win32::UI::WindowsAndMessaging::{DefWindowProcW, WM_POWERBROADCAST, PostQuitMessage, WM_DESTROY, PBT_POWERSETTINGCHANGE};
    use windows::Win32::System::Power::POWERBROADCAST_SETTING;
    use windows::Win32::System::SystemServices::GUID_MONITOR_POWER_ON;

    match msg {
        WM_POWERBROADCAST => {
            if wparam.0 as u32 == PBT_POWERSETTINGCHANGE {
                let settings = &*(lparam.0 as *const POWERBROADCAST_SETTING);
                if settings.PowerSetting == GUID_MONITOR_POWER_ON {
                    let state = settings.Data[0];
                    let is_on = state != 0;
                    IS_SCREEN_ON.store(is_on, Ordering::Relaxed);
                    println!("Screen power state changed: {}", if is_on { "ON" } else { "OFF" });
                }
            }
            windows::Win32::Foundation::LRESULT(1)
        }
        WM_DESTROY => {
            PostQuitMessage(0);
            windows::Win32::Foundation::LRESULT(0)
        }
        _ => DefWindowProcW(hwnd, msg, wparam, lparam),
    }
}

fn spawn_power_notifier() {
    std::thread::spawn(|| {
        use windows::Win32::Foundation::HWND;
        use windows::Win32::UI::WindowsAndMessaging::{
            CreateWindowExW, RegisterClassW, WNDCLASSW, CS_HREDRAW, CS_VREDRAW,
            WINDOW_EX_STYLE, WINDOW_STYLE, GetMessageW, DispatchMessageW, TranslateMessage, MSG, DestroyWindow
        };
        use windows::core::w;

        const DEVICE_NOTIFY_WINDOW_HANDLE: u32 = 0;

        unsafe {
            let class_name = w!("ActivityTrackerPowerNotifier");
            let wc = WNDCLASSW {
                style: CS_HREDRAW | CS_VREDRAW,
                lpfnWndProc: Some(power_wnd_proc),
                lpszClassName: class_name,
                ..Default::default()
            };

            if RegisterClassW(&wc) == 0 {
                eprintln!("Failed to register power notifier window class");
                return;
            }

            let hwnd = CreateWindowExW(
                WINDOW_EX_STYLE::default(),
                class_name,
                w!("PowerNotifier"),
                WINDOW_STYLE::default(),
                0,
                0,
                0,
                0,
                HWND::default(),
                None,
                None,
                None,
            );

            let hwnd = match hwnd {
                Ok(h) => h,
                Err(e) => {
                    eprintln!("Failed to create power notifier window: {:?}", e);
                    return;
                }
            };

            if hwnd.0.is_null() {
                eprintln!("Failed to create power notifier window (handle was null)");
                return;
            }

            // Register for monitor power notifications
            use windows::Win32::System::Power::RegisterPowerSettingNotification;
            use windows::Win32::System::SystemServices::GUID_MONITOR_POWER_ON;
            use windows::Win32::UI::WindowsAndMessaging::REGISTER_NOTIFICATION_FLAGS;
            let reg_handle = RegisterPowerSettingNotification(
                hwnd,
                &GUID_MONITOR_POWER_ON,
                REGISTER_NOTIFICATION_FLAGS(DEVICE_NOTIFY_WINDOW_HANDLE),
            );

            let reg_ok = match reg_handle {
                Ok(h) => Some(h),
                Err(e) => {
                    eprintln!("Failed to register monitor power notification: {:?}", e);
                    None
                }
            };

            let mut msg = MSG::default();
            while GetMessageW(&mut msg, None, 0, 0).as_bool() {
                let _ = TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }

            if let Some(h) = reg_ok {
                use windows::Win32::System::Power::UnregisterPowerSettingNotification;
                let _ = UnregisterPowerSettingNotification(h);
            }
            let _ = DestroyWindow(hwnd);
        }
    });
}

static TRACKER_STARTED: AtomicBool = AtomicBool::new(false);

pub fn start_tracker() {
    // 1. In-process guard: prevent spawning multiple tracker threads within the same process
    if TRACKER_STARTED.swap(true, Ordering::SeqCst) {
        println!("Activity tracker is already running in this process. Skipping duplicate thread.");
        return;
    }

    // 2. System-wide guard: check if another backend tracker process is already active on Windows
    use windows::Win32::System::Threading::CreateMutexW;
    use windows::Win32::Foundation::{GetLastError, ERROR_ALREADY_EXISTS};
    use windows::core::w;

    let _process_mutex = unsafe {
        let handle = CreateMutexW(None, true, w!("Local\\ActivityTracker_Backend_Tracker_Mutex"));
        if GetLastError() == ERROR_ALREADY_EXISTS {
            println!("Activity tracker backend is already running on this system. Skipping new tracker thread.");
            return;
        }
        handle
    };

    println!("Activity Tracker Started...\n");

    // Spawn monitor power state notifier
    spawn_power_notifier();

    // Clean up detailed visits on Sunday
    clean_old_visits_if_sunday();

    let current_session = Arc::new(Mutex::new(None::<Session>));
    let current_session_clone = Arc::clone(&current_session);

    let _ = ctrlc::set_handler(move || {
        println!("\nShutting down Activity Tracker... finalizing active session.");
        if let Ok(mut session_opt) = current_session_clone.lock() {
            if let Some(mut session) = session_opt.take() {
                session.end();
                save_session(&session);
                println!("Final session saved.");
            }
        }
        std::process::exit(0);
    });

    loop {
        if IS_TRACKING.load(Ordering::Relaxed) && IS_SCREEN_ON.load(Ordering::Relaxed) {
            if let Some((window, process_name)) = get_active_window_info() {
                // Check if the application is in ignored_apps
                let ignored_apps = crate::database::repository::get_ignored_apps();
                let is_ignored = ignored_apps.iter().any(|app| app.eq_ignore_ascii_case(&process_name));

                if is_ignored {
                    // Finalize active session if any
                    let prev_session = {
                        if let Ok(mut session_opt) = current_session.lock() {
                            session_opt.take()
                        } else {
                            None
                        }
                    };
                    if let Some(mut session) = prev_session {
                        session.end();
                        save_session(&session);
                        println!("Session ended because active application is ignored: {}", process_name);
                    }

                    thread::sleep(Duration::from_secs(5));
                    continue;
                }

                let cleaned = clean_window_title(&window);

                // Parse only once
                let parsed = parse_window(&cleaned, &process_name);

                let category = classify(&cleaned);

                // Start a new session only if something actually changed
                let changed = {
                    if let Ok(session_opt) = current_session.lock() {
                        match &*session_opt {
                            Some(session) => {
                                session.application != parsed.application
                                    || session.website != parsed.website
                                    || session.title != parsed.title
                            }
                            None => true,
                        }
                    } else {
                        false
                    }
                };

                if changed {
                    // End previous session
                    let prev_session = {
                        if let Ok(mut session_opt) = current_session.lock() {
                            session_opt.take()
                        } else {
                            None
                        }
                    };

                    if let Some(mut session) = prev_session {
                        session.end();

                        save_session(&session);

                        let duration = session.duration();

                        println!("\n======================================");
                        println!("SESSION ENDED");
                        println!("Application : {}", session.application);
                        println!("Website     : {:?}", session.website);
                        println!("Title       : {}", session.title);
                        println!("Category    : {}", session.category);
                        println!(
                            "Started At  : {}",
                            session.start_time.format("%H:%M:%S")
                        );
                        println!(
                            "Ended At    : {}",
                            session.end_time.unwrap().format("%H:%M:%S")
                        );
                        println!("Duration    : {} sec", duration.num_seconds());
                        println!("======================================");
                    }

                    // Start new session
                    let session = Session::new(
                        parsed.application.clone(),
                        parsed.website.clone(),
                        parsed.title.clone(),
                        category.clone(),
                        parsed.activity_key.clone(),
                    );

                    println!("\n--------------------------------------");
                    println!("SESSION STARTED");
                    println!("Application : {}", parsed.application);
                    println!("Website     : {:?}", parsed.website);
                    println!("Title       : {}", parsed.title);
                    println!("Category    : {}", category);
                    println!(
                        "Started At  : {}",
                        Local::now().format("%H:%M:%S")
                    );
                    println!("--------------------------------------");

                    if let Ok(mut session_opt) = current_session.lock() {
                        *session_opt = Some(session);
                    }
                }
            } else {
                // No active window (e.g. system locked)
                let prev_session = {
                    if let Ok(mut session_opt) = current_session.lock() {
                        session_opt.take()
                    } else {
                        None
                    }
                };
                if let Some(mut session) = prev_session {
                    session.end();
                    save_session(&session);
                    println!("Session ended because no active window was detected (possibly system locked).");
                }
            }
        } else {
            // Paused or screen is off: finalize active session if any
            let prev_session = {
                if let Ok(mut session_opt) = current_session.lock() {
                    session_opt.take()
                } else {
                    None
                }
            };
            if let Some(mut session) = prev_session {
                session.end();
                save_session(&session);
                if !IS_SCREEN_ON.load(Ordering::Relaxed) {
                    println!("Session ended because PC screen is off.");
                } else {
                    println!("Session ended because tracking was paused.");
                }
            }
        }

        // Check every 5 seconds
        thread::sleep(Duration::from_secs(5));
    }
}