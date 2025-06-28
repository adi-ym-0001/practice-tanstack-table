import type { Column, Table } from "@tanstack/react-table"

export function Filter({
  column,
  table,
}: {
  column: Column<any, any>
  table: Table<any>
}) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id)
  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === 'number' ? (
    <div className="flex gap-1">
      <input
        type="number"
        placeholder="Min"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        className="w-20 border px-1 rounded"
      />
      <input
        type="number"
        placeholder="Max"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        className="w-20 border px-1 rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      placeholder="Search..."
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="w-36 border px-1 rounded"
    />
  )
}
