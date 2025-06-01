import React, { FC, useEffect, useState } from 'react'
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

  const [activeNetwork, setActiveNetwork] = useState<WifiNetworkType | null>(null)
  const fetchActiveNetwork = async () => {
    try {
      const result = await invoke<WifiNetworkType[] | null>('get_active_network')
      setActiveNetwork(result?.[0] ?? null)
    } catch (error) {
      console.error('Failed to get active network', error)
    }
  }

  const disconnect = async () => {
    try {
      await invoke('disconnect_wifi')
      alert('Disconnected from Wi-Fi')
      setActiveNetwork(null)
    } catch (error) {
      alert('Failed to disconnect')
    }
  }

  useEffect(() => {
    fetchActiveNetwork()
  }, [])

  const filterOnActiveNetwork = () =>
    networks.filter(item => item.bssid !== activeNetwork?.bssid && item.ssid !== activeNetwork?.ssid)

  return (
    <div className="p-5 w-full">
      <h1>Wireless Intrusion Prevention System</h1>
      {!!activeNetwork &&
        <div className="bg-blue-800 text-white p-4 mb-4 rounded shadow flex justify-between items-center">
          <div>
            <p className="font-semibold">Connected to: <span className="text-green-300">{activeNetwork.ssid}</span></p>
            <p>BSSID: {activeNetwork.bssid}</p>
            <p>Signal: {activeNetwork.signal}</p>
            <p>authentication: {activeNetwork.authentication}</p>
            <p>authentication: {activeNetwork.encryption}</p>
            <p>risk: {activeNetwork.risk}</p>
          </div>
          <button
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
          >
            Disconnect
          </button>
        </div>
      }
      <button onClick={scanWifi}>Scan Wi-Fi</button>
      <div className="w-[100px] mb-5 mt-5">
        <Button variant="secondary" onClick={scanWifi}>Scan</Button>
      </div>
      <div>
        <Table tableTitle={tableTitle} notDataFound={!networks.length}>
          {filterOnActiveNetwork()?.map((row, index) => (
            <TableScanner
              isOpen={openIndex === index}
              onToggle={() => onToggle(index)}
              onFetchActiveNetwork={fetchActiveNetwork}
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
