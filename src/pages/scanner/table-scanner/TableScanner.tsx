import React, { FC } from 'react'
import { WifiNetworkType } from 'types'
import { invoke } from '@tauri-apps/api/core'
import { Button, Modal } from 'UI'
import { useIsModal } from 'hooks'


interface TableScannerProps {
  data: WifiNetworkType,
  index: number,
  isShowNetwork: boolean,
  onToggle: () => void
  onFetchActiveNetwork: () => void
}

const TableScanner: FC<TableScannerProps> = ({ data, isShowNetwork, onToggle, onFetchActiveNetwork }) => {
  const { bssid, risk, signal, ssid, encryption, authentication } = data
  const { isOpen, handleToggleIsOpenModal } = useIsModal()
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

  const handleOpenModal = (ssid: string) => {
    (risk === 'High' || risk === 'Critical') ? handleToggleIsOpenModal() : connectToWifi(ssid)
  }

  return (
    <>
      <tr onClick={onToggle}
          className={`border-b border-gray-700 transition hover:bg-[#e3dbdb] text-center ${isShowNetwork && 'bg-[rgba(232,231,231,1)]'}`}>
        <td className="p-3">{!ssid ? "Hidden Network" : ssid}</td>
        <td className="p-3">{!authentication ? "Hidden Network" :authentication }</td>
        <td className="p-3">{!encryption ? "Hidden Network" : encryption}</td>
        <td className="p-3">{!bssid ? "Hidden Network" : bssid}</td>
        <td className="p-3">{!signal ? "Hidden Network" : signal}</td>
        <td className="p-3">{!risk ? "Hidden Network" : risk}</td>
      </tr>

      {isShowNetwork && (
        <tr className="bg-[rgba(232,231,231,1)]">
          <td colSpan={6} className="p-5">
            <div className="w-[100px]">
              <Button onClick={() => handleOpenModal(ssid)} variant="secondary">Connect</Button>
            </div>
          </td>
        </tr>
      )}
      <Modal title="Alert" isOpen={isOpen} buttonText="Confirm" onClose={handleToggleIsOpenModal} onConfirm={() => connectToWifi(ssid)}>
        Risk of this network ({ssid}) is {risk}. Do you really want to connect?
      </Modal>
    </>
  )
}

export default TableScanner
