use std::process::Command;

#[tauri::command]
pub fn disconnect_wifi() -> Result<String, String> {
    let output = Command::new("netsh")
        .args(["wlan", "disconnect"])
        .output()
        .map_err(|e| format!("Failed to execute netsh disconnect: {}", e))?;

    if output.status.success() {
        Ok("Disconnected from Wi-Fi".to_string())
    } else {
        Err(format!(
            "Failed to disconnect: {}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}