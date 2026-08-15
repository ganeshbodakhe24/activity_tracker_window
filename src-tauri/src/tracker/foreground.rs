use windows::Win32::Foundation::{HWND, CloseHandle};
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow,
    GetWindowTextLengthW,
    GetWindowTextW,
    GetWindowThreadProcessId,
};
use windows::Win32::System::Threading::{
    OpenProcess,
    QueryFullProcessImageNameW,
};

pub fn get_active_window_info() -> Option<(String, String)> {
    unsafe {
        let hwnd: HWND = GetForegroundWindow();

        if hwnd.0.is_null() {
            return None;
        }

        let length = GetWindowTextLengthW(hwnd);
        let title = if length > 0 {
            let mut buffer = vec![0u16; (length + 1) as usize];
            GetWindowTextW(hwnd, &mut buffer);
            String::from_utf16_lossy(&buffer[..length as usize])
        } else {
            String::new()
        };

        let mut process_id: u32 = 0;
        GetWindowThreadProcessId(hwnd, Some(&mut process_id));
        
        let mut process_name = "Unknown".to_string();
        if process_id != 0 {
            if let Ok(process_handle) = OpenProcess(
                windows::Win32::System::Threading::PROCESS_QUERY_LIMITED_INFORMATION,
                false,
                process_id,
            ) {
                let mut buffer = vec![0u16; 1024];
                let mut size = buffer.len() as u32;
                
                let res = QueryFullProcessImageNameW(
                    process_handle,
                    windows::Win32::System::Threading::PROCESS_NAME_FORMAT(0),
                    windows::core::PWSTR(buffer.as_mut_ptr()),
                    &mut size,
                );

                let _ = CloseHandle(process_handle);

                if res.is_ok() && size > 0 {
                    let full_path = String::from_utf16_lossy(&buffer[..size as usize]);
                    if let Some(filename) = std::path::Path::new(&full_path)
                        .file_name()
                        .and_then(|s| s.to_str()) {
                        process_name = filename.to_string();
                    }
                }
            }
        }

        let display_title = if title.trim().is_empty() {
            process_name.clone()
        } else {
            title
        };

        Some((display_title, process_name))
    }
}