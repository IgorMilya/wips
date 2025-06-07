use std::fs::File;
use std::io::Write;
use std::process::Command;
use std::thread;
use std::time::Duration;

#[tauri::command]
pub fn connect_wifi(ssid: String, password: Option<String>) -> Result<String, String> {
    let known_profiles_output = Command::new("netsh")
        .args(["wlan", "show", "profiles"])
        .output()
        .map_err(|e| format!("Failed to get profiles: {}", e))?;

    let known_profiles = String::from_utf8_lossy(&known_profiles_output.stdout);
    let is_known = known_profiles
        .lines()
        .any(|line| line.trim().starts_with("All User Profile") && line.contains(&ssid));

    // Step 2: If known, try to connect first
    if is_known {
        let attempt = try_connect(&ssid)?;
        if attempt.success {
            return Ok(format!("Successfully connected to known network: {}", ssid));
        }

        // If known but connection failed, maybe due to wrong password
        if password.is_none() {
            return Err(format!(
                "Connection to saved network '{}' failed. Password may have changed.",
                ssid
            ));
        }
    }

    // Step 3: If not known or previous connection failed, and password is provided
    let pass =
        password.ok_or_else(|| "Password is required for new or failed networks.".to_string())?;
    let profile = generate_profile_xml(&ssid, &pass);
    let path = std::env::temp_dir().join("wifi_profile.xml");

    let mut file = File::create(&path).map_err(|e| format!("Failed to create XML file: {}", e))?;
    file.write_all(profile.as_bytes())
        .map_err(|e| format!("Failed to write XML: {}", e))?;

    // Remove old profile if it exists
    if is_known {
        let _ = Command::new("netsh")
            .args(["wlan", "delete", "profile", &format!("name={}", ssid)])
            .output(); // Ignore result
    }

    // Add the profile
    let add_output = Command::new("netsh")
        .args([
            "wlan",
            "add",
            "profile",
            &format!("filename={}", path.display()),
        ])
        .output()
        .map_err(|e| format!("Failed to add profile: {}", e))?;

    if !add_output.status.success() {
        return Err(format!(
            "Failed to add profile: {}",
            String::from_utf8_lossy(&add_output.stderr)
        ));
    }

    let connect = try_connect(&ssid)?;
    if connect.success {
        Ok(format!("Connected successfully to '{}'", ssid))
    } else {
        Err(format!(
            "Failed to connect to '{}': {}",
            ssid,
            connect.error.unwrap_or("Unknown error".to_string())
        ))
    }
}

fn try_connect(ssid: &str) -> Result<ConnectResult, String> {
    Command::new("netsh")
        .args(["wlan", "connect", &format!("name={}", ssid.trim())])
        .output()
        .map_err(|e| format!("Failed to execute netsh connect: {}", e))?;

    // Wait a few seconds to let the connection process complete
    thread::sleep(Duration::from_secs(5));

    // Check current connection status
    let status_output = Command::new("netsh")
        .args(["wlan", "show", "interfaces"])
        .output()
        .map_err(|e| format!("Failed to check current Wi-Fi connection: {}", e))?;

    let status_str = String::from_utf8_lossy(&status_output.stdout).to_string();

    let mut state_connected = false;
    let mut ssid_matched = false;

    for line in status_str.lines() {
        let trimmed = line.trim().to_string();
        if trimmed.starts_with("State") {
            if let Some(state_value) = trimmed.split(':').nth(1) {
                if state_value.trim().eq_ignore_ascii_case("connected") {
                    state_connected = true;
                }
            }
        }

        if line.trim().to_string().starts_with("SSID")
            && line.trim().to_string().contains(&format!("{}", ssid))
        {
            ssid_matched = true;
        }
    }

    if state_connected && ssid_matched {
        Ok(ConnectResult {
            success: true,
            error: None,
        })
    } else {
        Ok(ConnectResult {
            success: false,
            error: Some(
                "Connected command accepted, but system is not connected (possibly wrong password)"
                    .to_string(),
            ),
        })
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

struct ConnectResult {
    success: bool,
    error: Option<String>,
}
