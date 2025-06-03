mod structures;
mod wifi_functions;

use wifi_functions::{connect_wifi, disconnect_wifi, get_active_network, scan_wifi};

fn main(){

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            scan_wifi,
            connect_wifi,
            get_active_network,
            disconnect_wifi,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
