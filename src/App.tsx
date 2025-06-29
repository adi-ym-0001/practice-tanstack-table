import { type ColumnDef } from '@tanstack/react-table'
import React, { useState } from 'react'
import { VirtualizedEditableTable } from './components/generic-table/VirtualizedEditableTable'
import { makePeople } from './data/makePeople'
import { makeProducts } from './data/makeProducts'
import type { Person, Product } from './data/types'

export default function App() {
  const [people, setPeople] = useState(() => makePeople(5000))
  const [products, setProducts] = useState(() => makeProducts(3000))

  const [isEditingPeople, setIsEditingPeople] = useState(false)
  const [isEditingProducts, setIsEditingProducts] = useState(false)

  const [showPeopleCheckbox, setShowPeopleCheckbox] = useState(false)
  const [showProductsCheckbox, setShowProductsCheckbox] = useState(false)

  const [peopleDirty, setPeopleDirty] = useState<Record<string, Partial<Person>>>({})
  const [productDirty, setProductDirty] = useState<Record<string, Partial<Product>>>({})

  const [peopleSelection, setPeopleSelection] = useState<Record<string, boolean>>({})
  const [productSelection, setProductSelection] = useState<Record<string, boolean>>({})

  return (
    <div className="p-6 space-y-12">
      <section>
        <SectionContainer
          title="👤 ユーザーテーブル"
          data={people}
          setData={setPeople}
          columns={getPersonColumns(showPeopleCheckbox)}
          isEditing={isEditingPeople}
          setIsEditing={setIsEditingPeople}
          dirtyCells={peopleDirty}
          setDirtyCells={setPeopleDirty}
          rowSelection={peopleSelection}
          setRowSelection={setPeopleSelection}
          showCheckbox={showPeopleCheckbox}
          setShowCheckbox={setShowPeopleCheckbox}
        />
      </section>

      <section>
        <SectionContainer
          title="🛒 商品テーブル"
          data={products}
          setData={setProducts}
          columns={getProductColumns(showProductsCheckbox)}
          isEditing={isEditingProducts}
          setIsEditing={setIsEditingProducts}
          dirtyCells={productDirty}
          setDirtyCells={setProductDirty}
          rowSelection={productSelection}
          setRowSelection={setProductSelection}
          showCheckbox={showProductsCheckbox}
          setShowCheckbox={setShowProductsCheckbox}
        />
      </section>
    </div>
  )
}

function getPersonColumns(show: boolean): ColumnDef<Person>[] {
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
        (info.getValue<Date>() ?? new Date()).toLocaleDateString(),
    },
  ]

  if (!show) return base

  const hiddenKeys = ['id', 'progress', 'createdAt']

  return base.filter((col) => {
    const key = 'accessorKey' in col ? col.accessorKey : undefined
    return typeof key !== 'string' || !hiddenKeys.includes(key)
  })
}


function getProductColumns(show: boolean): ColumnDef<Product>[] {
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
        (info.getValue<Date>() ?? new Date()).toLocaleString(),
    },
  ]

  if (!show) return base

  const hiddenKeys = ['id', 'updatedAt']

  return base.filter((col) => {
    const key = 'accessorKey' in col ? col.accessorKey : undefined
    return typeof key !== 'string' || !hiddenKeys.includes(key)
  })
}


function SectionContainer<T extends { id: string }>({
  title,
  data,
  setData,
  columns,
  isEditing,
  setIsEditing,
  dirtyCells,
  setDirtyCells,
  rowSelection,
  setRowSelection,
  showCheckbox,
  setShowCheckbox,
}: {
  title: string
  data: T[]
  setData: React.Dispatch<React.SetStateAction<T[]>>
  columns: ColumnDef<T>[]
  isEditing: boolean
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  dirtyCells: Record<string, Partial<T>>
  setDirtyCells: React.Dispatch<React.SetStateAction<Record<string, Partial<T>>>>
  rowSelection: Record<string, boolean>
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  showCheckbox: boolean
  setShowCheckbox: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [selectedCount, setSelectedCount] = useState(0)
  const [committedItems, setCommittedItems] = useState<T[]>([])

  const selectedItems = data.filter((d) => rowSelection[d.id])

  const handleAssign = () => {
    setCommittedItems((prev) => [...prev, ...selectedItems])
    setRowSelection({})
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => setShowCheckbox((prev) => !prev)}
          className="border px-4 py-1 rounded bg-purple-100"
        >
          {showCheckbox ? 'チェック非表示' : 'パッケージ生成'}
        </button>

        {showCheckbox && (
          <button
            disabled={selectedCount === 0}
            onClick={handleAssign}
            className="border px-4 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-40"
          >
            割当
          </button>
        )}

        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="border px-4 py-1 rounded"
        >
          {isEditing ? 'キャンセル' : '編集'}
        </button>

        {isEditing && (
          <button
            onClick={() => {
              setData((prev) =>
                prev.map((row) =>
                  dirtyCells[row.id] ? { ...row, ...dirtyCells[row.id] } : row
                )
              )
              setDirtyCells({})
              setIsEditing(false)
            }}
            className="border px-4 py-1 rounded bg-blue-100"
          >
            保存
          </button>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="flex items-start gap-6 w-full">
        <div className={showCheckbox ? 'w-1/2' : 'w-full'}>
          <VirtualizedEditableTable
            data={data}
            columns={columns}
            isEditing={isEditing}
            dirtyCells={dirtyCells}
            setDirtyCells={setDirtyCells}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            showCheckbox={showCheckbox}
            onSelectedRowCountChange={setSelectedCount}
          />
        </div>

        {showCheckbox && (
          <div className="w-1/2 border rounded p-3 bg-gray-50 shadow-sm">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">📦 パッケージ</h3>
            {committedItems.length === 0 ? (
              <p className="text-gray-500 text-sm">まだ割当されたレコードはありません</p>
            ) : (
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-800">
                {committedItems.map((item) => (
                  <li key={item.id}>{JSON.stringify(item)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  )
}
