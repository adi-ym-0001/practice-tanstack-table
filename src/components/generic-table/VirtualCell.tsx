import React from 'react'

export const VirtualCell = React.memo(
  ({
    isEditing,
    value,
    isDirty,
    onChange,
  }: {
    isEditing: boolean
    value: unknown
    isDirty?: boolean
    onChange?: (val: unknown) => void
  }) => {
    const display = value instanceof Date ? value.toLocaleString() : String(value ?? '')
    const dirtyClass = isDirty ? 'bg-yellow-100' : ''

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
