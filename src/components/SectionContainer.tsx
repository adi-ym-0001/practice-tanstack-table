import { type ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { VirtualizedEditableTable } from './generic-table/VirtualizedEditableTable'

// 汎用セクションコンテナ：編集・選択・パッケージ対応
export function SectionContainer<T extends { id: string }>({
  title,
  data,
  setData,
  columns,
  isEditing,
  setIsEditing,
  dirtyCells,
  setDirtyCells,
  rowSelection,
  setRowSelection,
  showCheckbox,
  setShowCheckbox,
  renderCell,
}: {
  title: string
  data: T[]
  setData: React.Dispatch<React.SetStateAction<T[]>>
  columns: ColumnDef<T>[]
  isEditing: boolean
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  dirtyCells: Record<string, Partial<T>>
  setDirtyCells: React.Dispatch<React.SetStateAction<Record<string, Partial<T>>>>
  rowSelection: Record<string, boolean>
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  showCheckbox: boolean
  setShowCheckbox: React.Dispatch<React.SetStateAction<boolean>>
  renderCell?: (params: {
    row: T
    columnId: string
    value: unknown
  }) => string | undefined
}) {
  const [selectedCount, setSelectedCount] = useState(0)
  const [committedItems, setCommittedItems] = useState<T[]>([])
  const [filteredCount, setFilteredCount] = useState(0)

  // 選択中のレコードのみ抽出
  const selectedItems = data.filter((d) => rowSelection[d.id])

  // 「割当」ボタン押下時の処理
  const handleAssign = () => {
    setCommittedItems((prev) => [...prev, ...selectedItems])
    setRowSelection({})
  }

  return (
    <>
      {/* 操作バー＋件数表示 */}
      <div className="flex items-center gap-4 mb-2">
        {/* パッケージ生成モードのトグル */}
        <button
          onClick={() => setShowCheckbox((prev) => !prev)}
          className="border px-4 py-1 rounded bg-purple-100"
        >
          {showCheckbox ? 'チェック非表示' : 'パッケージ生成'}
        </button>

        {/* 割当ボタン（有効時のみ） */}
        {showCheckbox && (
          <button
            disabled={selectedCount === 0}
            onClick={handleAssign}
            className="border px-4 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-40"
          >
            割当
          </button>
        )}

        {/* 編集モードトグル */}
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="border px-4 py-1 rounded"
        >
          {isEditing ? 'キャンセル' : '編集'}
        </button>

        {/* 保存ボタン（編集時のみ表示） */}
        {isEditing && (
          <button
            onClick={() => {
              setData((prev) =>
                prev.map((row) =>
                  dirtyCells[row.id] ? { ...row, ...dirtyCells[row.id] } : row
                )
              )
              setDirtyCells({})
              setIsEditing(false)
            }}
            className="border px-4 py-1 rounded bg-blue-100"
          >
            保存
          </button>
        )}

        {/* ✅ 件数表示（フィルター後/全体） */}
        <span className="ml-auto text-sm text-gray-600">
          count: {filteredCount} / {data.length}
        </span>
      </div>

      {/* セクションタイトル */}
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <div className="flex items-start gap-6 w-full">
        {/* テーブル表示 */}
        <div className={showCheckbox ? 'w-1/2' : 'w-full'}>
          <VirtualizedEditableTable
            data={data}
            columns={columns}
            isEditing={isEditing}
            dirtyCells={dirtyCells}
            setDirtyCells={setDirtyCells}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            showCheckbox={showCheckbox}
            onSelectedRowCountChange={setSelectedCount}
            onFilteredCountChange={setFilteredCount} // ✅ フィルター件数を受け取る
            renderCell={renderCell}
          />
        </div>

        {/* パッケージサイドパネル */}
        {showCheckbox && (
          <div className="w-1/2 border rounded p-3 bg-gray-50 shadow-sm">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">📦 パッケージ</h3>
            {committedItems.length === 0 ? (
              <p className="text-gray-500 text-sm">まだ割当されたレコードはありません</p>
            ) : (
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-800">
                {committedItems.map((item) => (
                  <li key={item.id}>{JSON.stringify(item)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  )
}
