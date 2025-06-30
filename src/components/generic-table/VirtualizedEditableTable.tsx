// React Table & Virtualization 関連のインポート
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'

import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useEffect, useRef, useState } from 'react'

// 各種 UI コンポーネント
import { IndeterminateCheckbox } from '../ui/IndeterminateCheckbox'
import { Filter } from './Filter'
import { VirtualCell } from './VirtualCell'

// ----------------------------------------------------
// Props 型定義（TData は行の型：例 { id: string, name: string, ... }）
// ----------------------------------------------------
type Props<TData extends { id: string }> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  isEditing?: boolean
  showCheckbox?: boolean
  showFilters?: boolean
  dirtyCells?: Record<string, Partial<Record<keyof TData, unknown>>>
  setDirtyCells?: React.Dispatch<React.SetStateAction<Record<string, Partial<TData>>>>
  rowSelection?: Record<string, boolean>
  setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onSelectedRowCountChange?: (count: number) => void
  onFilteredCountChange?: (count: number) => void
  renderCell?: (params: {
    row: TData
    columnId: string
    value: unknown
  }) => string | undefined
  disableEditing?: boolean
  disableSelection?: boolean
  onTableReady?: (tableInstance: ReturnType<typeof useReactTable<TData>>) => void
}

// ----------------------------------------------------
// 本体：VirtualizedEditableTable（仮想スクロール対応テーブル）
// ----------------------------------------------------
export function VirtualizedEditableTable<TData extends { id: string }>({
  data,
  columns,
  isEditing = false,
  showCheckbox = false,
  showFilters = true,
  dirtyCells = {},
  setDirtyCells,
  rowSelection = {},
  setRowSelection,
  onSelectedRowCountChange,
  onFilteredCountChange,
  renderCell,
  disableEditing = false,
  disableSelection = false,
  onTableReady,
}: Props<TData>) {
  // ソート状態の管理
  const [sorting, setSorting] = useState<SortingState>([])

  // React Table のインスタンス生成（データ・列・機能指定）
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    enableSorting: true,
    enableRowSelection: !disableSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // 選択件数・フィルター件数を親に通知
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

  // table インスタンスを親へ expose
  useEffect(() => {
    onTableReady?.(table)
  }, [table, onTableReady])

  // 表示対象の行データと仮想スクローラーの設定
  const rows = table.getRowModel().rows
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // 行の高さ（px）
    overscan: 10, // 先読み件数
  })
  const virtualItems = virtualizer.getVirtualItems()
  const paddingTop = virtualItems[0]?.start ?? 0
  const paddingBottom =
    virtualizer.getTotalSize() -
    (virtualItems[virtualItems.length - 1]?.end ?? 0)

  // 全列のメタ情報
  const allColumns = table.getAllLeafColumns()

  return (
    <div className="border rounded overflow-hidden text-sm text-gray-900">
      <div ref={parentRef} className="h-[360px] overflow-y-auto overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0">
          {/* 各列の width を colgroup で指定 */}
          <colgroup>
            {!disableSelection && showCheckbox && <col style={{ width: 36 }} />}
            {allColumns.map((col) => (
              <col key={col.id} style={{ width: col.getSize() }} />
            ))}
          </colgroup>

          {/* ヘッダー（sticky） */}
          <thead className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {/* 左端：選択列（全選択チェックボックス） */}
                {!disableSelection && showCheckbox && (
                  <th className="border-b px-2 py-1 bg-white w-[36px]">
                    <IndeterminateCheckbox
                      checked={table.getIsAllRowsSelected()}
                      indeterminate={table.getIsSomeRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </th>
                )}

                {/* ヘッダー各列 */}
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b px-2 py-1 text-left font-medium text-gray-700 align-bottom bg-white select-none cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() ?? 150 }}
                    title={
                      header.column.getCanSort()
                        ? header.column.getNextSortingOrder() === 'asc'
                          ? '昇順ソート'
                          : header.column.getNextSortingOrder() === 'desc'
                            ? '降順ソート'
                            : 'ソート解除'
                        : undefined
                    }
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}

                    {/* フィルター入力欄 */}
                    {header.column.getCanFilter() && showFilters && (
                      <div className="mt-1">
                        <Filter column={header.column} table={table} />
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* ボディ（仮想化表示） */}
          <tbody>
            {/* 上部パディング */}
            {paddingTop > 0 && (
              <tr style={{ height: `${paddingTop}px` }}>
                <td colSpan={allColumns.length + (!disableSelection && showCheckbox ? 1 : 0)} />
              </tr>
            )}

            {/* 実データ行 */}
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
                  {/* 選択列 */}
                  {!disableSelection && showCheckbox && (
                    <td className="border px-2 py-1 align-top w-[36px]">
                      <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                    </td>
                  )}

                  {/* データセル */}
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

            {/* 下部パディング */}
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
