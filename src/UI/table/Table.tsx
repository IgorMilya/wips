import React, { FC, PropsWithChildren } from 'react'
import { TableHead } from './table-head'


interface TableProps extends PropsWithChildren {
  tableTitle: string[];
  notDataFound?: boolean
}

const Table: FC<TableProps> = ({tableTitle, children, notDataFound}) => {

  return (
    <div className="p-4 bg-white rounded-xl text-black">
      <div className="overflow-x-auto max-h-[400px] min-h-[400px]">
        <table className="min-w-full table-auto border-collapse">
          <TableHead tableTitle={tableTitle} />
          <tbody className="text-sm">
          {notDataFound && (
            <tr>
              <td colSpan={6}>
                <div className="flex items-center justify-center h-[352px] text-gray-500">
                  No data
                </div>
              </td>
            </tr>
          )}
          {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
