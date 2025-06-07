use crate::structures::WifiNetwork;
use crate::wifi_functions::parse_wifi_networks::parse_wifi_networks;
use std::process::Command;

#[tauri::command]
pub fn scan_wifi() -> Vec<WifiNetwork> {
    let output = Command::new("netsh")
        .args(["wlan", "show", "networks", "mode=bssid"])
        .output()
        .expect("Failed to execute command");

    let result = String::from_utf8_lossy(&output.stdout);

    parse_wifi_networks(&result, "BSSID", "Encryption")
}
