import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useEffect, useRef } from 'react'
import { Filter } from './Filter'
import { VirtualCell } from './VirtualCell'

type Props<TData extends { id: string }> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  isEditing: boolean
  dirtyCells: Record<string, Partial<TData>>
  setDirtyCells: React.Dispatch<React.SetStateAction<Record<string, Partial<TData>>>>
  rowSelection: Record<string, boolean>
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!)
  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate, rest.checked])
  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

export function VirtualizedEditableTable<TData extends { id: string }>({
  data,
  columns,
  isEditing,
  dirtyCells,
  setDirtyCells,
  rowSelection,
  setRowSelection,
}: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  })

  const rows = table.getRowModel().rows
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const paddingTop = virtualItems[0]?.start ?? 0
  const paddingBottom =
    virtualizer.getTotalSize() -
    (virtualItems[virtualItems.length - 1]?.end ?? 0)

  const allColumns = table.getAllLeafColumns()

  return (
    <div className="border rounded overflow-hidden text-sm text-gray-900">
      <div ref={parentRef} className="h-[360px] overflow-y-auto overflow-x-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-0">
          <colgroup>
            {!isEditing && <col style={{ width: 36 }} />}
            {allColumns.map((col) => (
              <col key={col.id} style={{ width: col.getSize() }} />
            ))}
          </colgroup>

          <thead className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {!isEditing && (
                  <th className="border-b px-2 py-1 bg-white w-[36px]">
                    <IndeterminateCheckbox
                      checked={table.getIsAllRowsSelected()}
                      indeterminate={table.getIsSomeRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </th>
                )}
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b px-2 py-1 text-left font-medium text-gray-700 align-bottom bg-white"
                    style={{ width: header.getSize() ?? 150 }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanFilter() && (
                      <div className="mt-1">
                        <Filter column={header.column} table={table} />
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {paddingTop > 0 && (
              <tr style={{ height: `${paddingTop}px` }}>
                <td colSpan={allColumns.length + (isEditing ? 0 : 1)} />
              </tr>
            )}
            {virtualItems.map((vi) => {
              const row = rows[vi.index]
              return (
                <tr
                  key={row.id}
                  className={`${
                    row.getIsSelected() ? 'bg-blue-50' : 'bg-white'
                  } even:bg-gray-50`}
                  style={{ height: `${vi.size}px` }}
                >
                  {!isEditing && (
                    <td className="border px-2 py-1 align-top w-[36px]">
                      <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => {
                    const rowId = row.original.id
                    const colId = cell.column.id
                    const dirty = dirtyCells[rowId]?.[colId]
                    return (
                      <td key={cell.id} className="border px-2 py-1 align-top">
                        <VirtualCell
                          isEditing={isEditing}
                          value={dirty ?? row.getValue(colId)}
                          isDirty={dirty !== undefined}
                          onChange={(val) =>
                            setDirtyCells((prev) => ({
                              ...prev,
                              [rowId]: {
                                ...prev[rowId],
                                [colId]: val,
                              },
                            }))
                          }
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {paddingBottom > 0 && (
              <tr style={{ height: `${paddingBottom}px` }}>
                <td colSpan={allColumns.length + (isEditing ? 0 : 1)} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
