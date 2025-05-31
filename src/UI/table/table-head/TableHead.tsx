import React, { FC } from 'react'

interface TableHeadProps {
  tableTitle: string[];
}
const TableHead: FC<TableHeadProps> = ({tableTitle}) => {

  return(
    <thead>
    <tr className="bg-white text-sm text-left border-b border-gray-700">
      {tableTitle.map(column => <th className="p-3 text-center" key={column}>{column}</th>)}
    </tr>
    </thead>
  )
}

export default TableHead;