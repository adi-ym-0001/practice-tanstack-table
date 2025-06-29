import { type ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { VirtualizedEditableTable } from './generic-table/VirtualizedEditableTable'
import { Button } from './ui/button'

// 汎用セクションコンテナ：編集・選択・パッケージ対応
export function SectionContainer<T extends { id: string }>({
  title,                        // セクションの見出しタイトル
  data,                         // テーブルのデータ配列
  setData,                      // データの更新関数（保存時などに使用）
  columns,                      // 表示カラム定義（TanStack形式）
  isEditing,                    // 編集モード状態（true: input表示）
  setIsEditing,                 // 編集モードの更新関数
  dirtyCells,                  // 編集中のセルの差分（idごとの変更Map）
  setDirtyCells,               // 差分の更新関数
  rowSelection,                // 選択状態（レコードID: true）
  setRowSelection,             // 選択状態の更新関数
  showCheckbox,                // チェックボックス列の表示有無
  setShowCheckbox,             // チェック列表示切替関数
  renderCell,                  // セルごとのスタイルクラス付与関数（任意）
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
  // ✔️ 現在チェックされている行数（VirtualizedEditableTableから通知）
  const [selectedCount, setSelectedCount] = useState(0)
  // 📦 割当確定後のレコード一覧（チェック→割当ボタン押下で確定）
  const [committedItems, setCommittedItems] = useState<T[]>([])
  // 🔍 現在フィルターで表示されている件数（VirtualizedEditableTableから通知）
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
        {!isEditing && (
          <Button
            onClick={() => setShowCheckbox((prev) => !prev)}
            className="bg-orange-400"
          >
            {showCheckbox ? '終了' : 'パッケージ生成'}
          </Button>
        )}

        {/* 割当ボタン（有効時のみ） */}
        {showCheckbox && (
          <Button
            disabled={selectedCount === 0}
            onClick={handleAssign}
            className="bg-blue-600 text-white text-sm disabled:opacity-40"
          >
            割当
          </Button>
        )}

        {/* 編集モードトグル */}
        {!showCheckbox && (
          <Button
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? 'キャンセル' : '編集'}
          </Button>
        )}

        {/* 保存ボタン（編集時のみ表示） */}
        {isEditing && (
          <Button
            onClick={() => {
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
