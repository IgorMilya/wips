use serde::Serialize;
use std::fs::File;
use std::io::Write;
use std::process::Command;

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
        network.risk = calculate_risk(
            &network.authentication,
            &network.encryption,
            &network.signal,
            &network.ssid,
        );
    }

    networks
}

fn calculate_risk(authentication: &str, encryption: &str, signal: &str, ssid: &str) -> String {
    let mut score = 0;

    // Authentication check
    score += match authentication {
        a if a.contains("WPA3") => 0,
        a if a.contains("WPA2") => 10,
        a if a.contains("WPA") => 20,
        a if a.contains("Open") => 50,
        _ => 30,
    };

    // Encryption check
    score += match encryption {
        e if e.contains("CCMP") => 0,
        e if e.contains("TKIP") => 20,
        e if e.contains("WEP") || e.is_empty() => 50,
        _ => 10,
    };

    // Signal strength (stronger = more suspicious in evil twin scenario)
    if let Ok(signal_strength) = signal.trim_end_matches('%').parse::<i32>() {
        score += match signal_strength {
            s if s > 80 => 20,
            s if s > 50 => 10,
            _ => 0,
        };
    }

    // SSID Anomalies
    let lowercase_ssid = ssid.to_lowercase();
    if lowercase_ssid.contains("free")
        || lowercase_ssid.contains("xfinity")
        || lowercase_ssid.contains("wifi")
    {
        score += 30;
    }
    println!("{}", score);
    // Total score classification
    match score {
        0..=39 => "Low".to_string(),
        40..=69 => "Medium".to_string(),
        70..=89 => "High".to_string(),
        _ => "Critical".to_string(),
    }
}

#[tauri::command]
fn connect_wifi(ssid: String, password: Option<String>) -> Result<String, String> {
    println!("Connecting to SSID: {}", ssid);

    if let Some(pass) = password {
        // New network — generate profile XML
        let profile = generate_profile_xml(&ssid, &pass);
        let path = std::env::temp_dir().join("wifi_profile.xml");

        let mut file = File::create(&path).map_err(|e| format!("Failed to create XML file: {}", e))?;
        file.write_all(profile.as_bytes())
            .map_err(|e| format!("Failed to write XML: {}", e))?;

        // Add the profile
        let add_output = Command::new("netsh")
            .args(["wlan", "add", "profile", &format!("filename={}", path.display())])
            .output()
            .map_err(|e| format!("Failed to add profile: {}", e))?;

        if !add_output.status.success() {
            return Err(format!(
                "Failed to add profile: {}",
                String::from_utf8_lossy(&add_output.stderr)
            ));
        }
    }

    // Now connect (works for both known and newly added profiles)
    let connect_output = Command::new("netsh")
        .args(["wlan", "connect", &format!("name={}", ssid.trim())])
        .output()
        .map_err(|e| format!("Failed to execute netsh connect: {}", e))?;

    if connect_output.status.success() {
        Ok(format!("Successfully connected to {}", ssid))
    } else {
        let err_msg = String::from_utf8_lossy(&connect_output.stderr);
        Err(format!("Failed to connect to {}: {}", ssid, err_msg))
    }
}

fn generate_profile_xml(ssid: &str, password: &str) -> String {
    format!(
        r#"<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
  <name>{ssid}</name>
  <SSIDConfig>
    <SSID>
      <name>{ssid}</name>
    </SSID>
  </SSIDConfig>
  <connectionType>ESS</connectionType>
  <connectionMode>manual</connectionMode>
  <MSM>
    <security>
      <authEncryption>
        <authentication>WPA2PSK</authentication>
        <encryption>AES</encryption>
        <useOneX>false</useOneX>
      </authEncryption>
      <sharedKey>
        <keyType>passPhrase</keyType>
        <protected>false</protected>
        <keyMaterial>{password}</keyMaterial>
      </sharedKey>
    </security>
  </MSM>
</WLANProfile>"#
    )
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![scan_wifi, connect_wifi])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
