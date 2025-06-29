import type { Person } from "@/data/types"

// セル単位で条件に応じたスタイルクラス（Tailwind）を返す関数
export const stylePersonCell = ({
  row,        // 対象行のデータ（Person）
  columnId,   // 現在の列ID（例: 'age', 'status' など）
  value,      // このセルの表示値（dirty 値 or 実データ）
}: {
  row: Person
  columnId: string
  value: unknown
}): string | undefined => {
  // 条件：
  // - 列IDが 'age'（Age列）
  // - 値が number 型
  // - 値が30〜39の範囲にある
  return columnId === 'age' &&
    typeof value === 'number' &&
    value >= 30 &&
    value < 40
    ? 'bg-yellow-50' // セルの背景色に淡い黄色を適用
    : undefined       // 条件に合わない場合はクラスなし
}
