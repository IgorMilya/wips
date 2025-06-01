use std::fs::File;
use std::process::Command;
use std::io::Write;
#[tauri::command]
pub fn connect_wifi(ssid: String, password: Option<String>) -> Result<String, String> {
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