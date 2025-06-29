import type { Product } from "@/data/types"

// 商品テーブルのセルに対して条件付きでスタイルを付与する関数
export const styleProductCell = ({
  row,        // レコード（Product）
  columnId,   // 現在処理している列の ID（例: 'stock', 'price'）
  value,      // セルに表示する値（編集中は dirty 値）
}: {
  row: Product
  columnId: string
  value: unknown
}): string | undefined => {
  // 条件：
  // - 列が 'stock'（在庫数）
  // - 値が number 型であり
  // - 値が 0（在庫切れ）である場合
  return columnId === 'stock' &&
    typeof value === 'number' &&
    value === 0
    // → 赤背景 + 濃い赤文字 + 太字で強調表示
    ? 'bg-red-100 text-red-800 font-semibold'
    : undefined // それ以外はスタイルを付けない
}
