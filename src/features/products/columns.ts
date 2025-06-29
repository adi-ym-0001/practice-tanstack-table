import { type ColumnDef } from '@tanstack/react-table'
import type { Product } from '../../data/types'

// ✅ パッケージ生成モードに応じて Product テーブルのカラム構成を返す関数
export const getProductColumns = (showCheckbox: boolean): ColumnDef<Product>[] => {
  // ベースとなるすべての列定義
  const base: ColumnDef<Product>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'price', header: 'Price' },
    { accessorKey: 'stock', header: 'Stock' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: (info) =>
        // 日付が null や undefined の場合は現在日時を表示
        (info.getValue<Date>() ?? new Date()).toLocaleString(),
    },
  ]

  // 通常モードではすべての列を表示
  if (!showCheckbox) return base

  // パッケージ生成モード中に非表示にする列キー一覧
  const hidden = ['id', 'updatedAt']

  // accessorKey が string の列のみ対象にして、非表示リストに含まれないものだけ返す
  return base.filter(
    (col) =>
      'accessorKey' in col &&                 // accessorFn ではなく accessorKey を持つ列
      typeof col.accessorKey === 'string' &&  // 型ガード
      !hidden.includes(col.accessorKey)       // 非表示リストに含まれていない列だけ残す
  )
}
