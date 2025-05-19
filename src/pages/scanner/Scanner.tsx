import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from 'UI'

function Scanner() {
  const [networks, setNetworks] = useState<string[]>([])
  async function scanWifi() {
    const result = await invoke<string[]>('scan_wifi')
    setNetworks(result)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Wireless Intrusion Prevention System</h1>
      <button onClick={scanWifi}>Scan Wi-Fi</button>
      <div className="w-[100px]">
        <Button variant={'secondary'} onClick={scanWifi}>Scan</Button>
      </div>
      <ul>
        {networks.map((network, index) => (
          <li key={index}>{network}</li>
        ))}

      </ul>
    </div>
  )
}

export default Scanner
