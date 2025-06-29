// ✅ React Table + 仮想スクロール構成
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

// 🧠 汎用テーブルの Props 型定義
type Props<TData extends { id: string }> = {
  data: TData[]
  columns: ColumnDef<TData>[]

  isEditing?: boolean                     // 編集モードフラグ
  showCheckbox?: boolean                 // チェックボックス列の表示制御
  dirtyCells?: Record<string, Partial<Record<keyof TData, unknown>>> // 編集中の差分
  setDirtyCells?: React.Dispatch<React.SetStateAction<Record<string, Partial<TData>>>>

  rowSelection?: Record<string, boolean> // 選択状態（idごとの真偽）
  setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>

  onSelectedRowCountChange?: (count: number) => void // 選択件数の通知
  onFilteredCountChange?: (count: number) => void    // フィルター後件数の通知

  renderCell?: (params: {
    row: TData
    columnId: string
    value: unknown
  }) => string | undefined                           // セルごとのスタイル調整など

  disableEditing?: boolean                           // 編集禁止モード（表示専用）
  disableSelection?: boolean                         // 選択機能の無効化
}

// ✅ チェックボックス（indeterminate対応）
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

// 📊 仮想化＋編集／選択対応の汎用テーブル本体
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
  // 🔧 React Table の初期化
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),            // 表示行
    getFilteredRowModel: getFilteredRowModel(),    // フィルター適用後
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: !disableSelection,         // 選択可否切替
  })

  // 🧠 選択件数とフィルター件数の通知（親コンポーネントへ）
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

  // 🎞️ スクロール領域の参照と仮想化セットアップ
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  })

  // 仮想表示の先頭／末尾 padding
  const virtualItems = virtualizer.getVirtualItems()
  const paddingTop = virtualItems[0]?.start ?? 0
  const paddingBottom =
    virtualizer.getTotalSize() -
    (virtualItems[virtualItems.length - 1]?.end ?? 0)

  // 全列情報を抽出（カラム幅や render に使用）
  const allColumns = table.getAllLeafColumns()

  return (
    <div className="border rounded overflow-hidden text-sm text-gray-900">
      <div ref={parentRef} className="h-[360px] overflow-y-auto overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0">
          {/* 📐 列幅調整 */}
          <colgroup>
            {!disableSelection && showCheckbox && <col style={{ width: 36 }} />}
            {allColumns.map((col) => (
              <col key={col.id} style={{ width: col.getSize() }} />
            ))}
          </colgroup>

          {/* 🔠 ヘッダー */}
          <thead className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {!disableSelection && showCheckbox && (
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

          {/* 📄 行本体 */}
          <tbody>
            {paddingTop > 0 && (
              <tr style={{ height: `${paddingTop}px` }}>
                <td colSpan={allColumns.length + (!disableSelection && showCheckbox ? 1 : 0)} />
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

                  {/* 各セルの描画 */}
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
