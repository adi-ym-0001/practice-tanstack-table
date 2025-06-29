import React from 'react'

// VirtualCell コンポーネント：表示セル or 編集セルの見た目を切り替える汎用セル
export const VirtualCell = React.memo(
  ({
    isEditing,
    value,
    isDirty,
    onChange,
  }: {
    isEditing: boolean // 編集モードかどうか
    value: unknown     // セルに表示する値（任意の型）
    isDirty?: boolean  // 変更済みのセルかどうか（ハイライト用）
    onChange?: (val: unknown) => void // 編集後の変更通知関数（オプション）
  }) => {
    // 値が Date の場合は日付文字列に、それ以外はそのまま文字列化（null/undefined は空）
    const display = value instanceof Date ? value.toLocaleString() : String(value ?? '')

    // isDirty が true のとき背景色でハイライト
    const dirtyClass = isDirty ? 'bg-yellow-100' : ''

    // 編集モード中は input を表示、それ以外は文字列スパンで表示
    return isEditing ? (
      <input
        className={`border rounded w-full px-1 ${dirtyClass}`}
        value={display}
        onChange={(e) => onChange?.(e.target.value)}
      />
    ) : (
      <span className={`block px-1 ${dirtyClass}`}>{display}</span>
    )
  }
)
