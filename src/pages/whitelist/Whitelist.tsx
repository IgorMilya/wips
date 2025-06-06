import { Table } from 'UI'
import { useGetWhitelistQuery } from 'store/api'
import { tableWhitelistTitle } from './whitelist.utils'
import { TableWhitelist } from './table-whitelist'
import { useState } from 'react'

const Whitelist = () => {
  const { data, isLoading, isError, error } = useGetWhitelistQuery()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const onToggle = (index: number) => setOpenIndex(openIndex === index ? null : index)

  return (
    <div className="p-5 w-full">
      <h1 className="text-xl font-bold mb-4">Whitelist</h1>
      {isError && <p className="text-red-500">Error: {String(error)}</p>}
      {isLoading ? <p>Loading...</p> : (
        <Table tableTitle={tableWhitelistTitle} notDataFound={!isLoading && data?.length === 0}>
          {data?.map((network, index) =>
            <TableWhitelist
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

export default Whitelist
