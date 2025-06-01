import React, { FC, useState } from 'react'
import { WifiNetworkType } from 'types'
import { invoke } from '@tauri-apps/api/core'
import { Button } from 'UI'


interface TableScannerProps {
  data: WifiNetworkType,
  index: number,
  isOpen: boolean,
  onToggle: () => void
  onFetchActiveNetwork: () => void
}

const TableScanner: FC<TableScannerProps> = ({ data, isOpen, onToggle, onFetchActiveNetwork }) => {
  const { bssid, risk, signal, ssid, encryption, authentication } = data

  const connectToWifi = async (ssid: string) => {
    const password = prompt(`Enter password for network "${ssid}"\n(Leave blank if it's saved already):`)
    try {
      const result = await invoke<string>('connect_wifi', {
        ssid,
        password: password || null,
      })
      alert(result)
      onFetchActiveNetwork()
    } catch (error: any) {
      alert(error)
    }
  }

  return (
    <>
      <tr onClick={onToggle}
          className={`border-b border-gray-700 transition hover:bg-[#e3dbdb] text-center ${isOpen && 'bg-[rgba(232,231,231,1)]'}`}>
        <td className="p-3">{!ssid ? "Hidden Network" : ssid}</td>
        <td className="p-3">{!authentication ? "Hidden Network" :authentication }</td>
        <td className="p-3">{!encryption ? "Hidden Network" : encryption}</td>
        <td className="p-3">{!bssid ? "Hidden Network" : bssid}</td>
        <td className="p-3">{!signal ? "Hidden Network" : signal}</td>
        <td className="p-3">{!risk ? "Hidden Network" : risk}</td>
      </tr>

      {isOpen && (
        <tr className="bg-[rgba(232,231,231,1)]">
          <td colSpan={6} className="p-5">
            <div className="w-[100px]">
              <Button onClick={() => connectToWifi(ssid)} variant="secondary">Connect</Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default TableScanner
