import React, { FC, useState } from 'react'
import { WifiNetworkType } from 'types'
import { invoke } from '@tauri-apps/api/core'
import { Button, Chip, Modal } from 'UI'
import { useIsModal } from 'hooks'
import { useAddBlacklistMutation, useAddWhitelistMutation } from 'store/api'

interface TableScannerProps {
  data: WifiNetworkType,
  isShowNetwork: boolean,
  onToggle: () => void
  onFetchActiveNetwork: () => void
}

const TableScanner: FC<TableScannerProps> = ({ data, isShowNetwork, onToggle, onFetchActiveNetwork }) => {
  const { bssid, risk, signal, ssid, encryption, authentication } = data
  const { isOpen, handleToggleIsOpenModal } = useIsModal()
  const [addBlacklist, { isLoading: isAdding }] = useAddBlacklistMutation()
  const [addWhitelist, { isLoading: isAddingWhitelist }] = useAddWhitelistMutation()
  const [isConnecting, setIsConnecting] = useState(false)

  const connectToWifi = async (ssid: string) => {
    setIsConnecting(true)
    try {
      const result = await invoke<string>('connect_wifi', {
        ssid,
        password: null,
      })
      alert(result)
      onFetchActiveNetwork()
      console.log("result", result)
    } catch (error: any) {
      const errMessage = typeof error === 'string' ? error : error.toString()
      console.log("errMessage", errMessage)

      const shouldPrompt =
        errMessage.includes('Password may have changed') ||
        errMessage.includes('Password is required for new or failed networks.') ||
        errMessage.toLowerCase().includes('unable to connect')

      if (shouldPrompt) {
        const password = prompt(`Connection failed. Enter new password for "${ssid}":`)
        if (!password) {
          alert('Password is required to connect.')
          return
        }

        try {
          const retry = await invoke<string>('connect_wifi', {
            ssid,
            password,
          })
          alert(retry)
          onFetchActiveNetwork()
        } catch (finalError: any) {
          alert('Still failed to connect: ' + finalError)
        }
      } else {
        alert('Connection failed: ' + errMessage)
      }
    } finally {
      setIsConnecting(false)
    }
  }



  const handleOpenModal = (ssid: string) => {
    (risk === 'H' || risk === 'C') ? handleToggleIsOpenModal() : connectToWifi(ssid)
  }

  const handleBlacklist = async (ssid: string, bssid: string) => {
    if (!ssid || !bssid) {
      alert('Cannot blacklist a hidden network without SSID or BSSID')
      return
    }
    try {
      const reason = prompt('Enter reason for blacklisting:') || 'Manually added'
      await addBlacklist({ ssid, bssid, reason }).unwrap()
      alert(`Network ${ssid} has been added to blacklist`)
    } catch (error) {
      alert('Failed to add network to blacklist: ' + JSON.stringify(error))
    }
  }

  const handleWhitelist = async (ssid: string, bssid: string) => {
    if (!ssid || !bssid) {
      alert('Cannot whitelist a hidden network without SSID or BSSID')
      return
    }
    try {
      await addWhitelist({ ssid, bssid }).unwrap()
      alert(`Network ${ssid} has been added to whitelist`)
    } catch (error) {
      alert('Failed to add network to whitelist: ' + JSON.stringify(error))
    }
  }

  return (
    <>
      <tr onClick={onToggle}
          className={`border-b border-gray-700 text-center hover:bg-gray-100 transition ${isShowNetwork ? 'bg-[rgba(232,231,231,1)]' : ''}`}>
        <td className="p-3">{!ssid ? 'Hidden Network' : ssid}</td>
        <td className="p-3">{!authentication ? 'Hidden Network' : authentication}</td>
        <td className="p-3">{!encryption ? 'Hidden Network' : encryption}</td>
        <td className="p-3">{!bssid ? 'Hidden Network' : bssid}</td>
        <td className="p-3">{!signal ? 'Hidden Network' : signal}</td>
        <td className="p-3"><Chip risk={risk} /></td>
      </tr>

      {isShowNetwork && (
        <tr className="bg-[rgba(232,231,231,1)]">
          <td colSpan={6} className="p-5">
            <div className="flex gap-5">
              <div className="w-[150px]">
                <Button
                  onClick={() => handleOpenModal(ssid)}
                  variant="secondary"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>

              </div>
              <div className="w-[150px]">
                <Button onClick={() => handleBlacklist(ssid, bssid)} variant="red"
                        disabled={isAdding || risk === "WL"}>Blacklist</Button>
              </div>
              <div className="w-[150px]">
                <Button onClick={() => handleWhitelist(ssid, bssid)} variant="primary"
                        disabled={isAddingWhitelist}>Whitelist</Button>
              </div>
            </div>
          </td>
        </tr>
      )}

      <Modal title="Alert" isOpen={isOpen} buttonText="Confirm" onClose={handleToggleIsOpenModal}
             onConfirm={() => connectToWifi(ssid)}>
        Risk of this network ({ssid}) is {risk}. Do you really want to connect?
      </Modal>
    </>
  )
}

export default TableScanner
