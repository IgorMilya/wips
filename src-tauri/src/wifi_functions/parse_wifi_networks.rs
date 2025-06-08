use crate::structures::WifiNetwork;
use crate::wifi_functions::calculate_risk::calculate_risk;

pub fn parse_wifi_networks(output: &str, bssid_label: &str, encryption_label: &str) -> Vec<WifiNetwork> {
    let mut networks = Vec::new();

    let mut current_ssid = String::new();
    let mut current_auth = String::new();
    let mut current_encryption = String::new();
    let mut current_bssid: Option<WifiNetwork> = None;

    for line in output.lines() {
        let trimmed = line.trim();

        if trimmed.starts_with("SSID") && trimmed.contains(":") {
            // Start new SSID section
            current_ssid = trimmed.splitn(2, ':').nth(1).unwrap_or("").trim().to_string();
        } else if trimmed.starts_with("Authentication") {
            current_auth = trimmed.splitn(2, ':').nth(1).unwrap_or("").trim().to_string();
        } else if trimmed.starts_with(encryption_label) {
            current_encryption = trimmed.splitn(2, ':').nth(1).unwrap_or("").trim().to_string();
        } else if trimmed.starts_with(bssid_label) {
            // Save previous BSSID if any
            if let Some(network) = current_bssid.take() {
                networks.push(network);
            }

            let bssid = trimmed.splitn(2, ':').nth(1).unwrap_or("").trim().to_string();

            current_bssid = Some(WifiNetwork {
                ssid: current_ssid.clone(),
                authentication: current_auth.clone(),
                encryption: current_encryption.clone(),
                bssid,
                signal: String::new(),
                risk: String::new(),
                is_evil_twin: false,
            });
        } else if trimmed.starts_with("Signal") {
            if let Some(network) = current_bssid.as_mut() {
                network.signal = trimmed.splitn(2, ':').nth(1).unwrap_or("").trim().to_string();
            }
        }
    }

    // Push last BSSID if any
    if let Some(network) = current_bssid {
        networks.push(network);
    }

    // Assign risk to each BSSID individually
    for net in networks.iter_mut() {
        net.risk = calculate_risk(&net.authentication, &net.encryption, &net.signal, &net.ssid);
    }

    networks
}

