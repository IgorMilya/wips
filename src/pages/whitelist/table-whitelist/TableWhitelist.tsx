import React, { FC } from 'react'
import { WhitelistedNetworkType } from 'types'
import { Button } from 'UI'
import { useDeleteWhitelistMutation } from 'store/api'

interface TableBlacklistProps {
  network: WhitelistedNetworkType
  isShowNetwork: boolean,
  onToggle: () => void
}

const TableWhitelist: FC<TableBlacklistProps> = ({ network, isShowNetwork, onToggle }) => {
  const { id, ssid, bssid, timestamp } = network
  const [deleteWhitelist, { isLoading: isDeleting }] = useDeleteWhitelistMutation()
  const handleDelete = async (id: string) => {
    try {
      await deleteWhitelist(id).unwrap()
      alert('Deleted successfully')
    } catch (err) {
      alert('Delete failed: ' + JSON.stringify(err))
    }
  }
  return (
    <>
      <tr onClick={onToggle} className={`border-b border-gray-700 text-center hover:bg-gray-100 transition ${isShowNetwork ? 'bg-[rgba(232,231,231,1)]' : ''}`}>
        <td className="p-3">{ssid || 'Hidden Network'}</td>
        <td className="p-3">{bssid || 'Hidden'}</td>
        <td className="p-3">{new Date(timestamp).toLocaleString()}</td>
      </tr>
      {isShowNetwork && (
        <tr className="bg-[rgba(232,231,231,1)]">
          <td colSpan={3} className="p-5">
              <div className="w-[150px] mt-5">
                <Button variant="red" disabled={isDeleting} onClick={() => handleDelete(id)}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button></div>
          </td>
        </tr>
      )}
    </>
  )
}

export default TableWhitelist
