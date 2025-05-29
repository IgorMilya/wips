import React, { FC, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button, Table } from 'UI'
import { tableTitle } from './scanner.utils'
import { TableScanner } from './table-scanner'
import { WifiNetworkType } from 'types'

const Scanner: FC = () => {
  const [networks, setNetworks] = useState<WifiNetworkType[]>([])
  async function scanWifi() {
    const result = await invoke<WifiNetworkType[]>('scan_wifi')
    console.log(result)
    setNetworks(result)
  }

  return (
    <div className="p-5 w-full">
      <h1>Wireless Intrusion Prevention System</h1>
      <button onClick={scanWifi}>Scan Wi-Fi</button>
      <div className="w-[100px] mb-5 mt-5">
        <Button variant={'secondary'} onClick={scanWifi}>Scan</Button>
      </div>
      <div>
      <Table tableTitle={tableTitle}>
        {networks.map((row, index) => (
          <TableScanner data={row} index={index} key={index} />
        ))}
      </Table>
      </div>
      <ul>
      </ul>
    </div>
  )
}

export default Scanner
