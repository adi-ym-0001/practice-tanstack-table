// TanStack Table 型のインポート（列定義 & Table型）
import type { ColumnDef, Table } from '@tanstack/react-table'

// React の状態管理フック
import { useState } from 'react'

// 仮想スクロール & 編集可能なテーブルコンポーネント（今回は表示専用で使う）
import { VirtualizedEditableTable } from './generic-table/VirtualizedEditableTable'

// 📘 表示専用のテーブルラッパー（編集やチェックは不可 / フィルター付き）
export function ReadonlyTable<T extends { id: string }>({
  title,
  data,
  columns,
  renderCell,
}: {
  title?: string                                 // 任意のタイトル見出し
  data: T[]                                      // 表示対象データ
  columns: ColumnDef<T>[]                        // テーブル定義（列情報）
  renderCell?: (params: {                        // セルの表示書式を上書き可能
    row: T
    columnId: string
    value: unknown
  }) => string | undefined
}) {
  // ✅ 現在のフィルター後の件数を管理（VirtualizedEditableTableから受け取る）
  const [filteredCount, setFilteredCount] = useState(data.length)

  // ✅ フィルター入力欄の表示ON/OFF（トグル切替）
  const [showFilters, setShowFilters] = useState(true)

  // ✅ Tableインスタンスを保持（後でフィルタークリアのために使う）
  const [tableInstance, setTableInstance] = useState<Table<T> | null>(null)

  return (
    <div className="space-y-2">
      {/* 🔘 ヘッダーエリア：タイトル + 操作ボタン */}
      <div className="flex justify-between items-end">
        {/* セクションタイトル（あれば表示） */}
        {title && (
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        )}

        {/* 操作ボタン群：フィルター切替 / リセット / 件数 */}
        <div className="flex items-center gap-3">
          {/* 🔍 フィルター欄のトグルボタン */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="text-sm px-2 py-1 bg-gray-200 rounded text-gray-800"
          >
            {showFilters ? 'フィルター非表示' : '🔍 フィルター表示'}
          </button>

          {/* 🧹 全フィルターリセット（tableInstanceが存在する時のみ有効） */}
          <button
            onClick={() => tableInstance?.resetColumnFilters()}
            className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded"
          >
            フィルタークリア
          </button>

          {/* 📊 件数表示（フィルター後 / 全体） */}
          <span className="text-sm text-gray-600">
            count: {filteredCount} / {data.length}
          </span>
        </div>
      </div>

      {/* 📄 表示専用テーブル本体 */}
      <VirtualizedEditableTable
        data={data}
        columns={columns}
        disableEditing            // ✅ 編集不可
        disableSelection          // ✅ 選択不可（チェック列なし）
        showFilters={showFilters} // ✅ フィルター表示ON/OFF切り替え
        renderCell={renderCell}   // ✅ セル表示のカスタマイズ（任意）
        onFilteredCountChange={setFilteredCount} // ✅ 絞り込み結果件数を取得
        onTableReady={setTableInstance}          // ✅ table instance を取得してボタンから操作可能に
      />
    </div>
  )
}
