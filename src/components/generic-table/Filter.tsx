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
        className="border px-1 w-20"
        placeholder="Min"
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
      />
      <input
        className="border px-1 w-20"
        placeholder="Max"
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
      />
    </div>
  ) : (
    <input
      className="border px-1 w-32"
      placeholder="Search..."
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
    />
  )
}
