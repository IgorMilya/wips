import React, { FC } from 'react'

interface TableHeadProps {
  tableTitle: string[];
}
const TableHead: FC<TableHeadProps> = ({tableTitle}) => {

  return(
    <thead>
    <tr className="bg-gray-800 text-sm text-left">
      <th className="p-3"></th>
      {tableTitle.map(column => (
        <th className="p-3" key={column}>{column}</th>
      ))}
    </tr>
    </thead>
  )
}

export default TableHead;