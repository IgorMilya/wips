export type WifiNetworkType = {
  ssid: string
  authentication: string
  encryption: string
  bssid: string
  signal: string
  risk: "L" | "M" | "H" | "C" | "WL"
  is_evil_twin: boolean
}