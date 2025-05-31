import React, { FC, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button, Table } from 'UI'
import { WifiNetworkType } from 'types'
import { TableScanner } from './table-scanner'
import { tableTitle } from './scanner.utils'

const Scanner: FC = () => {
  const [networks, setNetworks] = useState<WifiNetworkType[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const scanWifi = async () => {
    const result = await invoke<WifiNetworkType[]>('scan_wifi')
    setNetworks(result)
  }
  const onToggle = (index: number) => setOpenIndex(openIndex === index ? null : index)

  return (
    <div className="p-5 w-full">
      <h1>Wireless Intrusion Prevention System</h1>
      <button onClick={scanWifi}>Scan Wi-Fi</button>
      <div className="w-[100px] mb-5 mt-5">
        <Button variant="secondary" onClick={scanWifi}>Scan</Button>
      </div>
      <div>
        <Table tableTitle={tableTitle} notDataFound={!networks.length}>
          {networks?.map((row, index) => (
            <TableScanner
              isOpen={openIndex === index}
              onToggle={() => onToggle(index)}
              data={row}
              index={index}
              key={index} />
          ))}
        </Table>
      </div>
      <ul>
      </ul>
    </div>
  )
}

export default Scanner
