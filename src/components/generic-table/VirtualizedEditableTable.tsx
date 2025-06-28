import type { Person } from '@/data/types'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React from 'react'
import { Filter } from './Filter'
import { VirtualCell } from './VirtualCell'

type TableProps = {
  data: Person[]
  onSave: (patched: Record<string, Record<string, unknown>>) => void
  isEditing: boolean
  dirtyCells: Record<string, Record<string, unknown>>
  setDirtyCells: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, unknown>>>
  >
}

export function VirtualizedEditableTable({
  data,
  onSave,
  isEditing,
  dirtyCells,
  setDirtyCells,
}: TableProps) {
  const columns = React.useMemo<ColumnDef<Person>[]>(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'firstName', header: 'First Name', enableColumnFilter: true },
    { accessorKey: 'lastName', header: 'Last Name', enableColumnFilter: true },
    { accessorKey: 'age', header: 'Age', enableColumnFilter: true },
    { accessorKey: 'visits', header: 'Visits', enableColumnFilter: true },
    { accessorKey: 'status', header: 'Status', enableColumnFilter: true },
    { accessorKey: 'progress', header: 'Progress', enableColumnFilter: true },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      enableColumnFilter: true,
      cell: (info) =>
        (info.getValue<Date>() || new Date()).toLocaleDateString(),
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const parentRef = React.useRef<HTMLDivElement>(null)
  const rows = table.getRowModel().rows

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto border">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        <table className="absolute w-full top-0 left-0 border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanFilter() && (
                      <Filter column={header.column} table={table} />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualizer.getVirtualItems().map((vr) => {
              const row = rows[vr.index]
              return (
                <tr
                  key={row.id}
                  style={{
                    position: 'absolute',
                    transform: `translateY(${vr.start}px)`,
                    height: `${vr.size}px`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const rowId = row.original.id
                    const colId = cell.column.id
                    const dirty = dirtyCells[rowId]?.[colId]
                    const baseValue = dirty ?? row.getValue(colId)

                    return (
                      <td key={cell.id} className="border px-2">
                        <VirtualCell
                          isEditing={isEditing}
                          value={baseValue}
                          isDirty={dirty !== undefined}
                          onChange={(val) =>
                            setDirtyCells((prev) => ({
                              ...prev,
                              [rowId]: { ...prev[rowId], [colId]: val },
                            }))
                          }
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
