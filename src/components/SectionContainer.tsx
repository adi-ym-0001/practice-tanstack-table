// TanStack Table の列定義型・Table型をインポート
import type { ColumnDef, Table } from '@tanstack/react-table'

// React の状態管理
import { useState } from 'react'

// 表示・編集対応のテーブル本体
import { VirtualizedEditableTable } from './generic-table/VirtualizedEditableTable'

// ボタンUIコンポーネント
import { Button } from './ui/button'

// --------------------------------------------------------
// ⚙️ セクション単位で表をラップするコンテナコンポーネント
// 編集モード切替 / 削除 / 割当 / フィルタ切替 / チェック列制御対応
// --------------------------------------------------------
export function SectionContainer<T extends { id: string }>({
  title, // セクション見出しタイトル
  data,
  setData,
  columns,
  isEditing,
  setIsEditing,
  dirtyCells,
  setDirtyCells,
  rowSelection,
  setRowSelection,
  showCheckbox,       // 割当用チェック列の表示
  setShowCheckbox,
  renderCell,
}: {
  // 🔧 各種 Props 定義
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
  // ✅ 選択数・フィルター結果件数・フィルターON/OFF状態などのローカルステート
  const [selectedCount, setSelectedCount] = useState(0)
  const [committedItems, setCommittedItems] = useState<T[]>([])
  const [filteredCount, setFilteredCount] = useState(0)
  const [showFilters, setShowFilters] = useState(true)
  const [tableInstance, setTableInstance] = useState<Table<T> | null>(null) // フィルタークリア用に保持

  const selectedItems = data.filter((d) => rowSelection[d.id]) // チェック済みデータ一覧

  // ✅ 割当（パッケージ化）処理：チェック済みデータを committedItems に移動
  const handleAssign = () => {
    setCommittedItems((prev) => [...prev, ...selectedItems])
    setRowSelection({})
  }

  // ✅ 削除処理：チェック行を data から除外（id ベース）
  const handleDelete = () => {
    const idsToDelete = new Set(Object.keys(rowSelection).filter((id) => rowSelection[id]))
    setData((prev) => prev.filter((row) => !idsToDelete.has(String(row.id))))
    setRowSelection({})
    setDirtyCells({})
  }

  return (
    <>
      {/* 🎛️ 操作バー */}
      <div className="flex items-center gap-4 mb-2">
        {/* モード切替ボタン：通常⇄パッケージ */}
        {!isEditing && (
          <Button onClick={() => setShowCheckbox((prev) => !prev)} className="bg-orange-400">
            {showCheckbox ? '終了' : 'パッケージ生成'}
          </Button>
        )}

        {/* 割当ボタン（チェック列表示中のみ） */}
        {showCheckbox && (
          <Button
            disabled={selectedCount === 0}
            onClick={handleAssign}
            className="bg-blue-600 text-white text-sm disabled:opacity-40"
          >
            割当
          </Button>
        )}

        {/* 編集開始／キャンセル */}
        {!showCheckbox && (
          <Button onClick={() => setIsEditing((prev) => !prev)}>
            {isEditing ? 'キャンセル' : '編集'}
          </Button>
        )}

        {/* 編集モード中の保存ボタン */}
        {isEditing && (
          <Button
            onClick={() => {
              // dirtyCells で上書きし、編集終了
              setData((prev) =>
                prev.map((row) =>
                  dirtyCells[row.id] ? { ...row, ...dirtyCells[row.id] } : row
                )
              )
              setDirtyCells({})
              setIsEditing(false)
            }}
            className="bg-indigo-600"
          >
            保存
          </Button>
        )}

        {/* 削除ボタン（通常モードのみ） */}
        {!showCheckbox && !isEditing && (
          <Button
            disabled={selectedCount === 0}
            onClick={handleDelete}
            className="bg-red-600 text-white text-sm disabled:opacity-40"
          >
            削除
          </Button>
        )}

        {/* フィルター表示の ON/OFF 切替 */}
        <Button
          onClick={() => setShowFilters((prev) => !prev)}
          className="bg-gray-200 text-gray-800"
        >
          {showFilters ? 'フィルター非表示' : '🔍 フィルター表示'}
        </Button>

        {/* フィルタークリア：table インスタンスから直接呼び出し */}
        <Button
          onClick={() => tableInstance?.resetColumnFilters()}
          className="bg-gray-100 text-gray-600"
        >
          フィルタークリア
        </Button>

        {/* 結果件数カウント */}
        <span className="ml-auto text-sm text-gray-600">
          count: {filteredCount} / {data.length}
        </span>
      </div>

      {/* セクションタイトル */}
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      {/* 編集モードバッジ表示 */}
      {isEditing && (
        <div className="flex gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 font-medium">
            Edit Mode
          </span>
          {Object.keys(dirtyCells).length > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium">
              Unsaved Changes
            </span>
          )}
        </div>
      )}

      {/* 🧱 テーブル本体＋パッケージプレビュー */}
      <div className="flex items-start gap-6 w-full">
        {/* テーブル本体 */}
        <div className={showCheckbox ? 'w-1/2' : 'w-full'}>
          <VirtualizedEditableTable
            data={data}
            columns={columns}
            isEditing={isEditing}
            dirtyCells={dirtyCells}
            setDirtyCells={setDirtyCells}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            showCheckbox={!isEditing}           // 編集中はチェック列非表示
            disableSelection={isEditing}        // 編集中は選択不可
            showFilters={showFilters}
            renderCell={renderCell}
            onSelectedRowCountChange={setSelectedCount}
            onFilteredCountChange={setFilteredCount}
            onTableReady={setTableInstance}     // table インスタンスを受け取りフィルター操作用に保存
          />
        </div>

        {/* パッケージ表示パネル（チェックモード時のみ） */}
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
