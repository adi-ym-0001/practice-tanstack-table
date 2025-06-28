import { useState } from 'react'
import { VirtualizedEditableTable } from './components/generic-table/VirtualizedEditableTable'
import { makeData } from './data/makeData'

export default function App() {
  const [data, setData] = useState(() => makeData(10000))
  const [isEditing, setIsEditing] = useState(false)
  const [dirtyCells, setDirtyCells] = useState<Record<string, Record<string, unknown>>>({})

  const handleSave = () => {
    setData((prev) =>
      prev.map((row) => {
        const patch = dirtyCells[row.id]
        return patch ? { ...row, ...patch } : row
      })
    )
    setDirtyCells({})
    setIsEditing(false)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="border px-4 py-1 rounded"
        >
          {isEditing ? 'キャンセル' : '編集'}
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            className="border px-4 py-1 rounded bg-blue-100"
          >
            更新（差分のみ）
          </button>
        )}
      </div>
      <VirtualizedEditableTable
        data={data}
        onSave={handleSave}
        isEditing={isEditing}
        dirtyCells={dirtyCells}
        setDirtyCells={setDirtyCells}
      />
    </div>
  )
}
