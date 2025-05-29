import React, { FC, useState } from 'react'
import { WifiNetworkType } from 'types'


interface TableScannerProps {
  data: WifiNetworkType,
  index: number
}

const TableScanner: FC<TableScannerProps> = ({ data, index }) => {
  const [openRows, setOpenRows] = useState<number[]>([])
  const { bssid, risk, signal, ssid, encryption, authentication } = data
  const toggleRow = (index: number) => {
    setOpenRows((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index],
    )
  }

  return (
    <>
      <tr className="border-b border-gray-700">
        <td className="p-3">
          <button
            onClick={() => toggleRow(index)}
            className="focus:outline-none text-xl"
          >
            {openRows.includes(index) ? '▾' : '▸'}
          </button>
        </td>
        <td className="p-3">{ssid}</td>
        <td className="p-3">{authentication}</td>
        <td className="p-3">{encryption}</td>
        <td className="p-3">{bssid}</td>
        <td className="p-3">{signal}</td>
        <td className="p-3">{risk}</td>
      </tr>

      {openRows.includes(index) && history.length > 0 && (
        <div className="bg-gray-800 text-gray-300 w-full">
          Hello
        </div>
      )}
    </>
  )
}

export default TableScanner
