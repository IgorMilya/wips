import React, { FC, useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button, Chip, Table } from 'UI'
import { useGetBlacklistQuery, useGetWhitelistQuery } from 'store/api'
import { WifiNetworkType } from 'types'
import { TableScanner } from './table-scanner'
import { tableTitle } from './scanner.utils'
import { load } from '@tauri-apps/plugin-store'

const Scanner: FC = () => {
  const [networks, setNetworks] = useState<WifiNetworkType[]>([])
  const [localWhitelist, setLocalWhitelist] = useState<string[]>([])
  const [localBlacklist, setLocalBlacklist] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeNetwork, setActiveNetwork] = useState<WifiNetworkType | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const { data: blacklist = [] } = useGetBlacklistQuery()
  const { data: whitelist = [] } = useGetWhitelistQuery()

  const scanWifi = async () => {
    const result = await invoke<WifiNetworkType[]>('scan_wifi')
    setNetworks(result)
  }

  const onToggle = (index: number) => setOpenIndex(openIndex === index ? null : index)

  const fetchActiveNetwork = async () => {
    try {
      const result = await invoke<WifiNetworkType[] | null>('get_active_network')
      let network = result?.[0] ?? null

      if (network && localWhitelist.includes(network.bssid.toLowerCase())) {
        network = { ...network, risk: 'WL' }
      }

      setActiveNetwork(network)
    } catch (error) {
      console.error('Failed to get active network', error)
    }
  }

  // Sync backend whitelist to Tauri Store
  const syncWhitelistToStore = async () => {
    const store = await load('whitelist.json', { autoSave: false })
    const bssidList = whitelist.map(wl => wl.bssid.toLowerCase())
    await store.set('whitelist_bssids', bssidList)
    await store.save()
    setLocalWhitelist(bssidList)
  }

  const syncBlacklistToStore = async () => {
    const store = await load('blacklist.json', { autoSave: false })
    const bssidList = blacklist.map(bl => bl.bssid.toLowerCase())
    await store.set('blacklist_bssids', bssidList)
    await store.save()
    setLocalBlacklist(bssidList)
  }


  const loadWhitelistFromStore = async () => {
    const store = await load('whitelist.json', { autoSave: false })
    const val = await store.get<string[]>('whitelist_bssids') || []
    setLocalWhitelist(val.map(v => v.toLowerCase()))
  }

  const loadBlacklistFromStore = async () => {
    const store = await load('blacklist.json', { autoSave: false })
    const val = await store.get<string[]>('blacklist_bssids') || []
    setLocalBlacklist(val.map(v => v.toLowerCase()))
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
    loadWhitelistFromStore()
    loadBlacklistFromStore()
    fetchActiveNetwork()
    syncWhitelistToStore()
    syncBlacklistToStore()
  }, [])

  useEffect(() => {
    if (!!whitelist.length) {
      syncWhitelistToStore()
    }
  }, [whitelist])

  useEffect(() => {
    if (!!blacklist.length) {
      syncBlacklistToStore()
    }
  }, [blacklist])

  const filterOnActiveNetwork = () =>
    networks
      .filter(item =>
        item.bssid !== activeNetwork?.bssid &&
        !localBlacklist.includes(item.bssid.toLowerCase())
      )
      .map(item => ({
        ...item,
        risk: localWhitelist.includes(item.bssid.toLowerCase()) ? 'WL' : item.risk,
      }))
      .filter(item => {
        const term = searchTerm.toLowerCase()
        return (
          item.ssid?.toLowerCase().includes(term) ||
          item.authentication?.toLowerCase().includes(term) ||
          item.encryption?.toLowerCase().includes(term) ||
          item.risk?.toLowerCase().includes(term)
        )
      })



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
              <p className="font-bold">Risk:  <Chip risk={activeNetwork.risk} /></p>
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
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by SSID, Encryption, Authentication, or Risk"
          className="px-4 py-2 rounded w-full border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>
      <div>
        <Table tableTitle={tableTitle} notDataFound={!networks.length}>
          {filterOnActiveNetwork()?.map((row, index) => (
            <TableScanner
              key={index}
              isShowNetwork={openIndex === index}
              onToggle={() => onToggle(index)}
              onFetchActiveNetwork={fetchActiveNetwork}
              data={row}
            />
          ))}
        </Table>
      </div>
    </div>
  )
}

export default Scanner
