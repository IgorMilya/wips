import React, { FC, PropsWithChildren } from 'react'
import TableHead from './table-head/TableHead'


interface TableProps extends PropsWithChildren {
  tableTitle: string[];
}

const Table: FC<TableProps> = ({tableTitle, children}) => {


  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl">
      <div className="overflow-x-auto ">
        <table className="min-w-full table-auto border-collapse">
          <TableHead tableTitle={tableTitle} />
          <tbody className="text-sm">
          {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
