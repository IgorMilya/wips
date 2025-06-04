export type BlacklistedNetwork = {
  id: string
  ssid: string
  bssid: string
  timestamp: string
  reason?: string // <-- added
}