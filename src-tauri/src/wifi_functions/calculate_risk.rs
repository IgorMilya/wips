pub fn calculate_risk(authentication: &str, encryption: &str, signal: &str, ssid: &str) -> String {
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