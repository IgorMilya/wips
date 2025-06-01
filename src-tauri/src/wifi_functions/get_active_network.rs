use crate::structures::WifiNetwork;
use serde::Serialize;
use std::process::Command;
use crate::wifi_functions::parse_wifi_networks::parse_wifi_networks;

#[derive(Serialize)]
pub struct ActiveNetwork {
    ssid: String,
    bssid: String,
    signal: String,
    state: String,
}
#[tauri::command]
pub fn get_active_network() -> Vec<WifiNetwork> {
    let output = Command::new("netsh")
        .args(["wlan", "show", "interfaces"])
        .output()
        .expect("Failed to execute command");

    let result = String::from_utf8_lossy(&output.stdout);

    parse_wifi_networks(&result, "AP BSSID", "Cipher")
}




