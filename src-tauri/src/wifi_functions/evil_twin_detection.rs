use std::collections::HashMap;
use crate::structures::WifiNetwork;
use std::cmp::Reverse;
// #[derive(Debug, Clone)]
// pub struct WifiNetwork {
//     pub ssid: String,
//     pub bssid: String,
//     pub signal: u8,
//     pub authentication: String,
//     pub encryption: String,
//     pub risk: String, // L, M, H, C, WL
//     pub is_evil_twin: bool, // NEW
// }

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
    
    let ssid_count = ssid_map.len();

    for (ssid, nets) in ssid_map.iter_mut() {
        println!("Group: {} => {:?}", ssid, nets.iter().map(|n| (&n.bssid, &n.authentication, &n.encryption, &n.signal)).collect::<Vec<_>>());
        if ssid_count > 1 {
            // Sort by encryption strength descending
            nets.sort_by_key(|n| Reverse(encryption_strength(&n.authentication, &n.encryption)));
            let strongest = encryption_strength(&nets[0].authentication, &nets[0].encryption);
            for net in nets.iter_mut().skip(1) {
                let current_strength = encryption_strength(&net.authentication, &net.encryption);
                if current_strength < strongest {
                    net.is_evil_twin = true;
                    net.risk = "C".to_string(); // or "C" if more aggressive
                }
            }
        }
    }
}
