import { type ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { VirtualizedEditableTable } from './generic-table/VirtualizedEditableTable'

// 各データセクション（ユーザーや商品など）を構成する汎用コンポーネント
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
  columns: ColumnDef<T>[] // カラム定義（条件に応じて非表示列あり）
  isEditing: boolean
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  dirtyCells: Record<string, Partial<T>> // 編集差分（idごとに上書き候補）
  setDirtyCells: React.Dispatch<React.SetStateAction<Record<string, Partial<T>>>>
  rowSelection: Record<string, boolean> // 選択状態（id単位）
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  showCheckbox: boolean // パッケージ生成モード（チェック表示）
  setShowCheckbox: React.Dispatch<React.SetStateAction<boolean>>
  renderCell?: (params: {
    row: T
    columnId: string
    value: unknown
  }) => string | undefined // セル単位の動的クラス付け
}) {
  // 現在選択されているレコード数を記録（ボタン活性制御に使用）
  const [selectedCount, setSelectedCount] = useState(0)

  // パッケージ生成後に保持されるレコード群
  const [committedItems, setCommittedItems] = useState<T[]>([])

  // 現在選択状態のレコードを抽出
  const selectedItems = data.filter((d) => rowSelection[d.id])

  // 「割当」ボタン押下時にパッケージに追加
  const handleAssign = () => {
    setCommittedItems((prev) => [...prev, ...selectedItems])
    setRowSelection({})
  }

  return (
    <>
      {/* 操作ボタン群 */}
      <div className="flex items-center gap-4 mb-2">
        {/* パッケージ生成モードのトグル */}
        <button
          onClick={() => setShowCheckbox((prev) => !prev)}
          className="border px-4 py-1 rounded bg-purple-100"
        >
          {showCheckbox ? 'チェック非表示' : 'パッケージ生成'}
        </button>

        {/* 割当ボタン（選択があるときだけ有効） */}
        {showCheckbox && (
          <button
            disabled={selectedCount === 0}
            onClick={handleAssign}
            className="border px-4 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-40"
          >
            割当
          </button>
        )}

        {/* 編集モード切り替え */}
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="border px-4 py-1 rounded"
        >
          {isEditing ? 'キャンセル' : '編集'}
        </button>

        {/* 編集モード時に表示される保存ボタン */}
        {isEditing && (
          <button
            onClick={() => {
              // dirtyCells に基づいてデータを更新し、編集状態をリセット
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
      </div>

      {/* セクションタイトル */}
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <div className="flex items-start gap-6 w-full">
        {/* テーブル本体（生成モード中は左右 50/50 に） */}
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
            renderCell={renderCell}
          />
        </div>

        {/* パッケージパネル（生成モード時のみ表示） */}
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
