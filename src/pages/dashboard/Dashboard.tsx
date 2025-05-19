import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from 'UI'

function Dashboard() {
  const [networks, setNetworks] = useState<string[]>([])
  async function scanWifi() {
    const result = await invoke<string[]>('scan_wifi')
    setNetworks(result)
  }

  return (
    <div style={{ padding: 20 }}>
      Dashboard
    </div>
  )
}

export default Dashboard
