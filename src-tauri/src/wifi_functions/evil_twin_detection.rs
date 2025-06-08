use crate::structures::WifiNetwork;
use std::cmp::Reverse;
use std::collections::HashMap;

// Utility to assign numeric weight to encryption strength
fn encryption_strength(auth: &str, enc: &str) -> u8 {
    match (auth.to_lowercase().as_str(), enc.to_lowercase().as_str()) {
        ("wpa3-personal", _) => 4,
        ("wpa2-personal", "aes") | ("wpa2-personal", "ccmp") => 3,
        ("wpa2-personal", "tkip") => 2,
        ("wep", _) => 1,
        ("open", _) => 0,
        _ => 0,
    }
}

/// Marks Evil Twins in a list of Wi-Fi networks
pub fn mark_evil_twins(networks: &mut Vec<WifiNetwork>) {
    let mut ssid_map: HashMap<String, Vec<&mut WifiNetwork>> = HashMap::new();
    for net in networks.iter_mut() {
        ssid_map.entry(net.ssid.clone()).or_default().push(net);
    }

    for (ssid, group) in ssid_map.iter_mut() {
        if group.len() < 2 {
            continue; // Not suspicious
        }

        // Step 1: Compare by encryption strength
        group.sort_by_key(|n| Reverse(encryption_strength(&n.authentication, &n.encryption)));
        let strongest_strength =
            encryption_strength(&group[0].authentication, &group[0].encryption);

        // Step 2: Calculate average signal strength
        let avg_signal: i32 = group.iter().map(|n|
            {
                let mut signal = 0;
                if let Ok(signal_strength) = n.signal.trim_end_matches('%').parse::<i32>() {
                    signal = signal_strength
                }
                signal
            }
        ).sum::<i32>() / group.len() as i32;

        for net in group.iter_mut() {
            let this_strength = encryption_strength(&net.authentication, &net.encryption);

            let mut suspicion_score = 0;

            // Weak encryption compared to strongest in group
            if this_strength < strongest_strength {
                suspicion_score += 2;
            }

            // Signal strength is significantly stronger than average (>20%)
            if let Ok(signal_strength) = net.signal.trim_end_matches('%').parse::<i32>() {
                println!("name stronger {} {}", signal_strength, ssid);
                println!("score stronger {}", suspicion_score);
                if signal_strength > avg_signal + 20 {
                    suspicion_score += 2;
                }
            }

            // Signal is suspiciously weak (possibly distant rogue AP)
            if let Ok(signal_strength) = net.signal.trim_end_matches('%').parse::<i32>() {
                println!("name weak {} {}", signal_strength, ssid);
                println!("score weak {}", suspicion_score);
                if signal_strength + 20 < avg_signal {
                    suspicion_score += 1;
                }
            }

            println!("Suspicion score name {}", ssid);
            println!("Suspicion score: {}", suspicion_score);
            // Heuristic: Channels mismatch (optional if you parse `Channel`)
            // Example: if let Some(channel_diff) = check_channel_diff(...) { suspicion_score += 1; }
            if suspicion_score >= 3 {
                net.is_evil_twin = true;
                net.risk = "C".to_string(); // Critical risk
            } else if suspicion_score == 2 {
                net.is_evil_twin = true;
                net.risk = "H".to_string(); // High risk
            }
        }
    }
}
