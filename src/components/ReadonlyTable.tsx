import { type ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { VirtualizedEditableTable } from './generic-table/VirtualizedEditableTable'

// ReadonlyTable.tsx	表示とフィルタ専用の軽量テーブルラッパー。操作なしの読み取り専用表示に特化
export function ReadonlyTable<T extends { id: string }>({
  title,
  data,
  columns,
  renderCell,
}: {
  title?: string
  data: T[]
  columns: ColumnDef<T>[]
  renderCell?: (params: {
    row: T
    columnId: string
    value: unknown
  }) => string | undefined
}) {
  const [filteredCount, setFilteredCount] = useState(data.length)
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        {title && (
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        )}
        {/* ✅ 件数表示 */}
        <span className="text-sm text-gray-600">
          count: {filteredCount} / {data.length}
        </span>
      </div>

      <VirtualizedEditableTable
        data={data}
        columns={columns}
        disableEditing
        disableSelection
        renderCell={renderCell}
        onFilteredCountChange={setFilteredCount} // ✅ フィルター後件数を受け取る
      />
    </div>
  )
}
