// ✅ shadcn/ui の Checkbox コンポーネントをインポート
import { Checkbox } from '@/components/ui/checkbox'

// ✅ 中間状態（indeterminate）対応のチェックボックスラッパー
export function IndeterminateCheckbox({
  checked,         // 通常のチェック状態（boolean）
  indeterminate,   // 中間状態フラグ（true のとき indeterminate 表示にする）
  onChange,        // チェック変更時に呼ばれるハンドラ（通常の <input type="checkbox"> 互換）
  className,       // スタイルクラス（オプション）
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}) {
  return (
    <Checkbox
      // ✅ shadcn/ui の Checkbox は 'indeterminate' という文字列で中間状態を認識
      // `checked` プロパティには true / false / 'indeterminate' のいずれかを渡せる
      checked={indeterminate ? 'indeterminate' : checked}

      // ✅ shadcn の onCheckedChange は boolean | "indeterminate" を受け取る
      // ここでは TanStack Table の挙動に合わせて疑似的な `ChangeEvent<HTMLInputElement>` を構築して渡している
      onCheckedChange={(val) => {
        const syntheticEvent = {
          target: { checked: Boolean(val) },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }}

      className={className}
    />
  )
}
