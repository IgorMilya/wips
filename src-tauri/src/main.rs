mod wifi_functions;
mod structures;
use wifi_functions::{scan_wifi, connect_wifi, disconnect_wifi, get_active_network};


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![scan_wifi, connect_wifi, get_active_network, disconnect_wifi])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
