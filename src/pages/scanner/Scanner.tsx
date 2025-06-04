import React, { FC, useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button, Table } from 'UI'
import { useGetBlacklistQuery } from 'store/api'
import { WifiNetworkType } from 'types'
import { TableScanner } from './table-scanner'
import { tableTitle } from './scanner.utils'

const Scanner: FC = () => {
  const [networks, setNetworks] = useState<WifiNetworkType[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [activeNetwork, setActiveNetwork] = useState<WifiNetworkType | null>(null)
  const [isActive, setIsActive] = useState(false)
  const { data: blacklist = [] } = useGetBlacklistQuery()

  const scanWifi = async () => {
    const result = await invoke<WifiNetworkType[]>('scan_wifi')
    setNetworks(result)
  }
  const onToggle = (index: number) => setOpenIndex(openIndex === index ? null : index)

  const fetchActiveNetwork = async () => {
    try {
      const result = await invoke<WifiNetworkType[] | null>('get_active_network')
      setActiveNetwork(result?.[0] ?? null)
    } catch (error) {
      console.error('Failed to get active network', error)
    }
  }

  const disconnect = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await invoke('disconnect_wifi')
      alert('Disconnected from Wi-Fi')
      setActiveNetwork(null)
    } catch (error) {
      alert('Failed to disconnect')
    }
  }
  const onIsActive = () => setIsActive(!isActive)

  useEffect(() => {
    fetchActiveNetwork()
  }, [])

  const filterOnActiveNetwork = () =>
    networks
      .filter(item =>
        item.bssid !== activeNetwork?.bssid &&
        !blacklist.some(bl => bl.bssid.toLowerCase() === item.bssid.toLowerCase()),
      )


  return (
    <div className="p-5 w-full">
      <h1 className="font-bold text-[20px] mb-[10px]">Wireless Intrusion Prevention System</h1>
      {!!activeNetwork &&
        <div className="relative">
          <div onClick={onIsActive}
               className="bg-secondary text-white p-4 mb-4 rounded-t shadow flex justify-between items-center cursor-pointer">
            <div>
              <p className="font-semibold">Connected to: <span className="text-green-300">{activeNetwork.ssid}</span>
              </p>
            </div>
            <div className="w-[120px]">
              <Button onClick={disconnect} variant="red">Disconnect</Button>
            </div>
          </div>
          {isActive &&
            <div className="bg-[rgb(70,8,118)] text-white p-5 rounded-b shadow absolute top-[72px] left-0 z-10">
              <p className="font-bold">BSSID: <span className="font-normal">{activeNetwork.bssid}</span></p>
              <p className="font-bold">Signal: <span className="font-normal">{activeNetwork.signal}</span></p>
              <p className="font-bold">Risk: <span className="font-normal">{activeNetwork.risk}</span></p>
              <p className="font-bold">Authentication: <span
                className="font-normal">{activeNetwork.authentication}</span>
              </p>
              <p className="font-bold">Encryption: <span className="font-normal">{activeNetwork.encryption}</span></p>
            </div>}
        </div>
      }
      <div className="w-[100px] mb-5 mt-5">
        <Button variant="secondary" onClick={scanWifi}>Scan</Button>
      </div>
      <div>
        <Table tableTitle={tableTitle} notDataFound={!networks.length}>
          {filterOnActiveNetwork()?.map((row, index) => (
            <TableScanner
              key={index}
              isShowNetwork={openIndex === index}
              onToggle={() => onToggle(index)}
              onFetchActiveNetwork={fetchActiveNetwork}
              data={row}/>
          ))}
        </Table>
      </div>
      <ul>
      </ul>
    </div>
  )
}

export default Scanner
