// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::process::Command;

#[tauri::command]
fn scan_wifi() -> Vec<String> {
    let output = Command::new("netsh")
        .args(["wlan", "show", "networks", "mode=bssid"])
        .output()
        .expect("Failed to execute command");

    let result = String::from_utf8_lossy(&output.stdout);
    let networks: Vec<String> = result
        .lines()
        .filter(|line| line.contains("SSID"))
        .map(|line| line.trim().replace("SSID ", "").replace(":", ""))
        .collect();

    networks
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![scan_wifi])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}

