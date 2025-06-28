import React from 'react'

export const VirtualCell = React.memo(
  ({
    isEditing,
    value,
    onChange,
    isDirty,
  }: {
    isEditing: boolean
    value: unknown
    isDirty?: boolean
    onChange?: (val: unknown) => void
  }) => {
    const displayValue =
      value instanceof Date ? value.toLocaleString() : String(value ?? '')

    const className = [
      'px-2 py-1',
      isDirty ? 'bg-yellow-100' : '',  // 変更されたセルに色をつける
    ]
      .filter(Boolean)
      .join(' ')

    return isEditing ? (
      <input
        className={`border rounded w-full ${className}`}
        value={displayValue}
        onChange={(e) => onChange?.(e.target.value)}
      />
    ) : (
      <span className={className}>{displayValue}</span>
    )
  }
)

