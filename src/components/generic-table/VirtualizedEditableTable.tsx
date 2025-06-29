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

// 🧠 テーブル用 Props 型定義（行 ID あり＋柔軟な編集・選択制御が可能）
type Props<TData extends { id: string }> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  isEditing?: boolean // 編集モード（true で <input> 表示）
  showCheckbox?: boolean // 選択列の表示制御
  dirtyCells?: Record<string, Partial<Record<keyof TData, unknown>>> // 差分マッピング
  setDirtyCells?: React.Dispatch<React.SetStateAction<Record<string, Partial<TData>>>>
  rowSelection?: Record<string, boolean> // 行ごとの選択状態
  setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onSelectedRowCountChange?: (count: number) => void // 選択件数変更通知
  onFilteredCountChange?: (count: number) => void // フィルター件数変更通知
  renderCell?: (params: {
    row: TData
    columnId: string
    value: unknown
  }) => string | undefined // スタイルクラスを列ごとに付与可能
  disableEditing?: boolean // セルの編集無効化（readonly モード）
  disableSelection?: boolean // 選択列の無効化（checkbox 列そのものを非表示に）
}

// ✅ indeterminate 状態に対応したカスタム checkbox（主に「全選択」セル用）
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

// 📦 本体コンポーネント：編集・選択・フィルター対応＋仮想スクロール内包
export function VirtualizedEditableTable<TData extends { id: string }>({
  data,
  columns,
  isEditing = false,
  showCheckbox = false,
  dirtyCells = {},
  setDirtyCells,
  rowSelection = {},
  setRowSelection,
  onSelectedRowCountChange,
  onFilteredCountChange,
  renderCell,
  disableEditing = false,
  disableSelection = false,
}: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(), // 初期 row モデル（フィルター前）
    getFilteredRowModel: getFilteredRowModel(), // フィルター適用後
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: !disableSelection, // 選択列の制御
  })

  // ✅ 外部に件数通知（選択数 + フィルター後数）
  useEffect(() => {
    if (!disableSelection) {
      onSelectedRowCountChange?.(table.getSelectedRowModel().rows.length)
    }
    onFilteredCountChange?.(table.getFilteredRowModel().rows.length)
  }, [
    table.getSelectedRowModel().rows.length,
    table.getFilteredRowModel().rows.length,
    onSelectedRowCountChange,
    onFilteredCountChange,
    disableSelection,
  ])

  const rows = table.getRowModel().rows
  const parentRef = useRef<HTMLDivElement>(null)

  // 🎞️ 仮想スクロールセットアップ（パフォーマンス最適化）
  const virtualizer = useVirtualizer({
    count: rows.length, // 全体の行数（仮想レンダリング対象数）
    getScrollElement: () => parentRef.current, // スクロール対象の DOM 要素
    estimateSize: () => 36, // 各行の高さ（px）を予測
    overscan: 10, // 前後に追加描画する余白行数（スクロール体感向上用）
  })

  // 今実際にブラウザに描画すべき行」のリストを取得
  const virtualItems = virtualizer.getVirtualItems()
  // 上下のパディング計算（仮想スクロール用）
  const paddingTop = virtualItems[0]?.start ?? 0
  // 下部のパディング計算（仮想スクロール用）
  const paddingBottom =
    virtualizer.getTotalSize() -
    (virtualItems[virtualItems.length - 1]?.end ?? 0)

  // 全カラムの幅を取得（チェック列を除く）
  const allColumns = table.getAllLeafColumns()

  return (
    <div className="border rounded overflow-hidden text-sm text-gray-900">
      <div ref={parentRef} className="h-[360px] overflow-y-auto overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0">
          {/* 📐 列ごとの幅指定 */}
          <colgroup>
            {!disableSelection && showCheckbox && <col style={{ width: 36 }} />}
            {allColumns.map((col) => (
              <col key={col.id} style={{ width: col.getSize() }} />
            ))}
          </colgroup>

          {/* 🔠 テーブルヘッダー + 列フィルター */}
          <thead className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {/* 左端チェック列ヘッダー */}
                {!disableSelection && showCheckbox && (
                  <th className="border-b px-2 py-1 bg-white w-[36px]">
                    <IndeterminateCheckbox
                      checked={table.getIsAllRowsSelected()}
                      indeterminate={table.getIsSomeRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </th>
                )}
                {/* 通常カラム */}
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

          {/* 📄 ボディ（仮想スクロール + セル描画） */}
          <tbody>
            {/* 上部 padding */}
            {paddingTop > 0 && (
              <tr style={{ height: `${paddingTop}px` }}>
                <td colSpan={allColumns.length + (!disableSelection && showCheckbox ? 1 : 0)} />
              </tr>
            )}

            {/* 実際のレンダリング対象行 */}
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
                  {/* ✅ チェック列 */}
                  {!disableSelection && showCheckbox && (
                    <td className="border px-2 py-1 align-top w-[36px]">
                      <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                    </td>
                  )}

                  {/* 通常セル：VirtualCell 経由で input or span */}
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
                        <VirtualCell
                          isEditing={!disableEditing && isEditing}
                          value={value}
                          isDirty={dirty !== undefined}
                          onChange={(val) =>
                            setDirtyCells?.((prev) => ({
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

            {/* 下部 padding */}
                        {paddingBottom > 0 && (
              <tr style={{ height: `${paddingBottom}px` }}>
                <td colSpan={allColumns.length + (!disableSelection && showCheckbox ? 1 : 0)} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
