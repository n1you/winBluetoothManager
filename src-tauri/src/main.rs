// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 桌面端二进制入口，实际 Tauri 初始化逻辑在 lib.rs 的 run() 中。
fn main() {
    win_bluetooth_manager_lib::run()
}
