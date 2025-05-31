import React, { FC, useState } from 'react'
import { WifiNetworkType } from 'types'
import { invoke } from '@tauri-apps/api/core'
import { Button } from 'UI'


interface TableScannerProps {
  data: WifiNetworkType,
  index: number,
  isOpen: boolean,
  onToggle: () => void
}

const TableScanner: FC<TableScannerProps> = ({ data, isOpen, onToggle }) => {
  const { bssid, risk, signal, ssid, encryption, authentication } = data

  const connectToWifi = async (ssid: string) => {
    const password = prompt(`Enter password for network "${ssid}"\n(Leave blank if it's saved already):`)
    try {
      const result = await invoke<string>('connect_wifi', {
        ssid,
        password: password || null,
      })
      alert(result)
    } catch (error: any) {
      alert(error)
    }
  }

  return (
    <>
      <tr onClick={onToggle}
          className={`border-b border-gray-700 transition hover:bg-[#e3dbdb] text-center ${isOpen && 'bg-[rgba(232,231,231,1)]'}`}>
        <td className="p-3">{ssid}</td>
        <td className="p-3">{authentication}</td>
        <td className="p-3">{encryption}</td>
        <td className="p-3">{bssid}</td>
        <td className="p-3">{signal}</td>
        <td className="p-3">{risk}</td>
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
