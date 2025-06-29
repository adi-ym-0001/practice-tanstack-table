import { type ColumnDef } from '@tanstack/react-table'
import type { Person } from '../../data/types'

// パッケージ生成モードの状態に応じて Person テーブルの列定義を返す関数
export const getPersonColumns = (showCheckbox: boolean): ColumnDef<Person>[] => {
  // ベースとなるカラム定義（すべての列を表示）
  const base: ColumnDef<Person>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'firstName', header: 'First Name' },
    { accessorKey: 'lastName', header: 'Last Name' },
    { accessorKey: 'age', header: 'Age' },
    { accessorKey: 'visits', header: 'Visits' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'progress', header: 'Progress' },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: (info) =>
        // null や undefined の場合は現在日時を使って日付表示
        (info.getValue<Date>() ?? new Date()).toLocaleDateString(),
    },
  ]

  // 通常モード：すべての列を表示
  if (!showCheckbox) return base

  // パッケージ生成モード時に非表示にする列のキー一覧
  const hidden = ['id', 'progress', 'createdAt']

  // 表示対象列だけをフィルタリングして返す
  return base.filter(
    (col) =>
      'accessorKey' in col && // accessorKey が存在する列のみ対象
      typeof col.accessorKey === 'string' &&
      !hidden.includes(col.accessorKey)
  )
}
