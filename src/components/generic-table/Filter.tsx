import type { Column, Table } from '@tanstack/react-table'

// Filter.tsx	数値・文字列による列フィルター UI を提供
export function Filter({
  column,
  table,
}: {
  column: Column<any, any> // 対象の列
  table: Table<any>        // 対象のテーブル
}) {
  // この列の最初の値（プリフィルタ状態）を取得し、型を判別に使う
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id)

  // 現在のフィルター値（string または [min, max]）
  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === 'number' ? (
    // ▼ 数値列の場合：範囲指定フィルター（Min-Max）を表示
    <div className="flex gap-1">
      {/* 最小値入力 */}
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
      {/* 最大値入力 */}
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
    // ▼ 文字列列の場合：通常の文字列検索フィルターを表示
    <input
      className="border px-1 w-32"
      placeholder="Search..."
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
    />
  )
}
