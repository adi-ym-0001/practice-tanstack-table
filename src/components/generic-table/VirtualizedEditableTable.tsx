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

// テーブルコンポーネントの Props 型定義
type Props<TData extends { id: string }> = {
  data: TData[] // 表示するデータ配列
  columns: ColumnDef<TData>[] // TanStack Table のカラム定義
  isEditing: boolean // 編集モードフラグ
  showCheckbox: boolean // チェックボックス列を表示するか
  dirtyCells: Record<string, Partial<Record<keyof TData, unknown>>> // 編集中の値を保持
  setDirtyCells: React.Dispatch<React.SetStateAction<Record<string, Partial<TData>>>> // 編集値 setter
  rowSelection: Record<string, boolean> // 選択中の行
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>> // 選択 setter
  onSelectedRowCountChange?: (count: number) => void // 選択件数通知
  renderCell?: (params: {
    row: TData
    columnId: string
    value: unknown
  }) => string | undefined // セルに独自クラス名を付けるオプション
}

// チェックボックスの indeterminate 対応
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

// メインのテーブルコンポーネント
export function VirtualizedEditableTable<TData extends { id: string }>({
  data,
  columns,
  isEditing,
  showCheckbox,
  dirtyCells,
  setDirtyCells,
  rowSelection,
  setRowSelection,
  onSelectedRowCountChange,
  renderCell,
}: Props<TData>) {
  // TanStack Table のセットアップ
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  })

  // 選択中の件数が変わったときに通知
  useEffect(() => {
    onSelectedRowCountChange?.(table.getSelectedRowModel().rows.length)
  }, [table.getSelectedRowModel().rows.length, onSelectedRowCountChange])

  const rows = table.getRowModel().rows
  const parentRef = useRef<HTMLDivElement>(null)

  // 仮想スクロール用の Virtualizer セットアップ
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  })

  // 仮想アイテム情報とパディングを取得
  const virtualItems = virtualizer.getVirtualItems()
  const paddingTop = virtualItems[0]?.start ?? 0
  const paddingBottom =
    virtualizer.getTotalSize() -
    (virtualItems[virtualItems.length - 1]?.end ?? 0)

  const allColumns = table.getAllLeafColumns()

  return (
    <div className="border rounded overflow-hidden text-sm text-gray-900">
      <div ref={parentRef} className="h-[360px] overflow-y-auto overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0">
          {/* 各列の幅を定義 */}
          <colgroup>
            {showCheckbox && <col style={{ width: 36 }} />}
            {allColumns.map((col) => (
              <col key={col.id} style={{ width: col.getSize() }} />
            ))}
          </colgroup>

          {/* ヘッダー部分 */}
          <thead className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {showCheckbox && (
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
                    {/* フィルターがある列には Filter コンポーネントを表示 */}
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

          {/* ボディ部分（仮想スクロール + 編集 + 選択対応） */}
          <tbody>
            {paddingTop > 0 && (
              <tr style={{ height: `${paddingTop}px` }}>
                <td colSpan={allColumns.length + (showCheckbox ? 1 : 0)} />
              </tr>
            )}

            {virtualItems.map((vi) => {
              const row = rows[vi.index]
              return (
                <tr
                  key={row.id}
                  className={`${
                    row.getIsSelected() ? 'bg-blue-50' : ''
                  } ${vi.index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  style={{ height: `${vi.size}px` }}
                >
                  {showCheckbox && (
                    <td className="border px-2 py-1 align-top w-[36px]">
                      <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                    </td>
                  )}
                  {/* 各セル */}
                  {row.getVisibleCells().map((cell) => {
                    const rowId = row.original.id
                    const colId = cell.column.id
                    const dirty = dirtyCells[rowId]?.[colId as keyof TData]
                    const value = dirty ?? row.getValue(colId)

                    const customClass = renderCell?.({
                      row: row.original,
                      columnId: colId,
                      value,
                    })

                    return (
                      <td
                        key={cell.id}
                        className={`border px-2 py-1 align-top ${customClass ?? ''}`}
                      >
                        {/* 編集対応セル */}
                        <VirtualCell
                          isEditing={isEditing}
                          value={value}
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
                <td colSpan={allColumns.length + (showCheckbox ? 1 : 0)} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
