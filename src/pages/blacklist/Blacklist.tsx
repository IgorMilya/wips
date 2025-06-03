import { useGetBlacklistQuery, useDeleteBlacklistMutation } from 'store/api'
import { useState } from 'react'

const Blacklist = () => {
  const { data, isLoading, isError, error } = useGetBlacklistQuery()
  const [deleteBlacklist, { isLoading: isDeleting }] = useDeleteBlacklistMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteBlacklist(id).unwrap()
      alert('Deleted successfully')
    } catch (err) {
      alert('Delete failed: ' + JSON.stringify(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Blacklist</h1>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-500">Error: {String(error)}</p>}
      {!isLoading && data?.length === 0 && <p>No blacklisted networks found.</p>}
      <ul>
        {data?.map(network => (
          <li key={network.id} className="flex justify-between items-center border-b py-2">
            <span><strong>{network.ssid}</strong> — {network.bssid}</span>
            <button
              className="text-red-600 hover:text-red-800"
              disabled={deletingId === network.id || isDeleting}
              onClick={() => handleDelete(network.id)}
            >
              {deletingId === network.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Blacklist
