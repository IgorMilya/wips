use std::process::Command;
use serde::Serialize;

#[derive(Serialize)]
struct WifiNetwork {
    ssid: String,
    authentication: String,
    encryption: String,
    bssid: String,
    signal: String,
    risk: String,
}

#[tauri::command]
fn scan_wifi() -> Vec<WifiNetwork> {
    let output = Command::new("netsh")
        .args(["wlan", "show", "networks", "mode=bssid"])
        .output()
        .expect("Failed to execute command");

    let result = String::from_utf8_lossy(&output.stdout);
    println!("{}", result);

    let mut networks = Vec::new();
    let mut current_network: Option<WifiNetwork> = None;

    for line in result.lines() {
        if line.starts_with("SSID") && line.contains(':') {
            // If we have a previous network being processed, add it to the list
            if let Some(network) = current_network.take() {
                networks.push(network);
            }

            // Start a new network
            let ssid = line.split(':').nth(1).unwrap_or("").trim().to_string();
            current_network = Some(WifiNetwork {
                ssid,
                authentication: String::new(),
                encryption: String::new(),
                bssid: String::new(),
                signal: String::new(),
                risk: String::new(),
            });
        } else if let Some(network) = current_network.as_mut() {
            if line.trim().to_string().starts_with("Authentication") {
                network.authentication = line.split(':').nth(1).unwrap_or("").trim().to_string();
            } else if line.trim().to_string().starts_with("Encryption") {
                network.encryption = line.split(':').nth(1).unwrap_or("").trim().to_string();
            } else if line.trim().to_string().starts_with("BSSID") {
                let parts: Vec<&str> = line.splitn(2, ':').collect();
                if parts.len() > 1 {
                    network.bssid = parts[1].trim().to_string();
                }
            } else if line.trim().to_string().starts_with("Signal") {
                network.signal = line.split(':').nth(1).unwrap_or("").trim().to_string();
            }
        }
    }

    // Add the last network if it exists
    if let Some(network) = current_network.take() {
        networks.push(network);
    }

    // Calculate risk for each network
    for network in networks.iter_mut() {
        network.risk = calculate_risk(&network.authentication, &network.encryption, &network.signal);
    }

    networks
}

fn calculate_risk(authentication: &str, encryption: &str, signal: &str) -> String {
    let mut risk_score = 0;

    // Authentication risk
    if authentication.contains("WPA2") {
        risk_score += 1;
    } else if authentication.contains("WPA") {
        risk_score += 2;
    } else if authentication.contains("Open") {
        risk_score += 5;
    }

    // Encryption risk
    if encryption.contains("CCMP") {
        risk_score += 1;
    } else if encryption.contains("TKIP") {
        risk_score += 3;
    } else if encryption.contains("WEP") {
        risk_score += 5;
    } else if encryption.is_empty() {
        risk_score += 5;
    }

    // Signal strength risk (stronger signal means higher risk if compromised)
    if let Ok(signal_percent) = signal.trim_end_matches('%').parse::<i32>() {
        if signal_percent > 75 {
            risk_score += 3;
        } else if signal_percent > 50 {
            risk_score += 2;
        } else if signal_percent > 25 {
            risk_score += 1;
        }
    }

    match risk_score {
        0..=3 => "Low".to_string(),
        4..=6 => "Medium".to_string(),
        7..=9 => "High".to_string(),
        _ => "Critical".to_string(),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![scan_wifi])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}