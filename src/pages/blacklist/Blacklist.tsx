import { useGetBlacklistQuery } from 'store/api'

const Blacklist = () => {
  const { data, isLoading, isError, error } = useGetBlacklistQuery()
  console.log(data)
  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Blacklist</h1>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-500">Error: {String(error)}</p>}
      {!isLoading && data?.length === 0 && <p>No blacklisted networks found.</p>}
      <ul>
        {data?.map(network => (
          <li key={network._id}>
            <strong>{network.ssid}</strong> — {network.bssid}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Blacklist