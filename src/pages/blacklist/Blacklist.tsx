import { useGetBlacklistQuery } from 'store/api'
import { Table } from 'UI'
import { tableBlacklistTitle } from './blacklist.utils'
import { TableBlacklist } from './table-blacklist'
import { useState } from 'react'

const Blacklist = () => {
  const { data, isLoading, isError, error } = useGetBlacklistQuery()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const onToggle = (index: number) => setOpenIndex(openIndex === index ? null : index)
  return (
    <div className="p-5 w-full">
      <h1 className="text-xl font-bold mb-4">Blacklist</h1>
      {isError && <p className="text-red-500">Error: {String(error)}</p>}
      {isLoading ? <p>Loading...</p> : (
        <Table tableTitle={tableBlacklistTitle} notDataFound={!isLoading && data?.length === 0}>
          {data?.map((network, index) =>
            <TableBlacklist
              isShowNetwork={openIndex === index}
              onToggle={() => onToggle(index)}
              key={network.id}
              network={network}
            />,
          )}
        </Table>
      )
      }

    </div>
  )
}

export default Blacklist
