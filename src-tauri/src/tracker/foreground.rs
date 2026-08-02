use windows::Win32::Foundation::HWND;
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow,
    GetWindowTextLengthW,
    GetWindowTextW,
};

pub fn get_active_window_title() -> Option<String> {
    unsafe {
        let hwnd: HWND = GetForegroundWindow();

        if hwnd.0.is_null() {
            return None;
        }

        let length = GetWindowTextLengthW(hwnd);

        if length == 0 {
            return None;
        }

        let mut buffer = vec![0u16; (length + 1) as usize];

        GetWindowTextW(hwnd, &mut buffer);

        Some(String::from_utf16_lossy(&buffer[..length as usize]))
    }
}