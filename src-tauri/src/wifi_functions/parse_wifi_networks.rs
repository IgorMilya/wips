use crate::structures::WifiNetwork;
use crate::wifi_functions::calculate_risk::calculate_risk;

pub fn parse_wifi_networks(output: &str, bssid: &str, encryption: &str) -> Vec<WifiNetwork> {
    let mut networks = Vec::new();
    let mut current_network: Option<WifiNetwork> = None;

    for line in output.lines() {
        if line.trim().to_string().starts_with("SSID") {
            println!("{}", line);
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
            } else if line.trim().to_string().starts_with(encryption) {
                network.encryption = line.split(':').nth(1).unwrap_or("").trim().to_string();
            } else if line.trim().to_string().starts_with(bssid) {
                let parts: Vec<&str> = line.splitn(2, ':').collect();
                if parts.len() > 1 {
                    network.bssid = parts[1].trim().to_string();
                }
            } else if line.trim().to_string().starts_with("Signal") {
                network.signal = line.split(':').nth(1).unwrap_or("").trim().to_string();
            }
        }
    }

    if let Some(network) = current_network.take() {
        networks.push(network);
    }

    for net in networks.iter_mut() {
        net.risk = calculate_risk(&net.authentication, &net.encryption, &net.signal, &net.ssid);
    }

    networks
}