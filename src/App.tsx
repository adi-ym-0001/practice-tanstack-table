import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { VirtualizedEditableTable } from './components/generic-table/VirtualizedEditableTable'
import { makePeople } from './data/makePeople'
import { makeProducts } from './data/makeProducts'
import type { Person, Product } from './data/types'

export default function App() {
  const [people, setPeople] = useState(() => makePeople(5000))
  const [products, setProducts] = useState(() => makeProducts(3000))

  const [isEditingPeople, setIsEditingPeople] = useState(false)
  const [isEditingProducts, setIsEditingProducts] = useState(false)

  const [peopleDirty, setPeopleDirty] = useState<Record<string, Partial<Person>>>({})
  const [productDirty, setProductDirty] = useState<Record<string, Partial<Product>>>({})

  const handleSavePeople = () => {
    setPeople((prev) =>
      prev.map((row) =>
        peopleDirty[row.id] ? { ...row, ...peopleDirty[row.id] } : row
      )
    )
    setPeopleDirty({})
    setIsEditingPeople(false)
  }

  const handleSaveProducts = () => {
    setProducts((prev) =>
      prev.map((row) =>
        productDirty[row.id] ? { ...row, ...productDirty[row.id] } : row
      )
    )
    setProductDirty({})
    setIsEditingProducts(false)
  }

  const personColumns: ColumnDef<Person>[] = [
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
      cell: (info) => (info.getValue<Date>() ?? new Date()).toLocaleDateString(),
    },
  ]

  const productColumns: ColumnDef<Product>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'price', header: 'Price' },
    { accessorKey: 'stock', header: 'Stock' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: (info) => (info.getValue<Date>() ?? new Date()).toLocaleString(),
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <section>
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => setIsEditingPeople((prev) => !prev)}
            className="border px-4 py-1 rounded"
          >
            {isEditingPeople ? 'キャンセル' : 'ユーザー編集'}
          </button>
          {isEditingPeople && (
            <button
              onClick={handleSavePeople}
              className="border px-4 py-1 rounded bg-blue-100"
            >
              保存（ユーザー）
            </button>
          )}
        </div>
        <h2 className="text-lg font-semibold mb-2">👤 ユーザーテーブル</h2>
        <VirtualizedEditableTable
          data={people}
          columns={personColumns}
          isEditing={isEditingPeople}
          dirtyCells={peopleDirty}
          setDirtyCells={setPeopleDirty}
        />
      </section>

      <section>
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => setIsEditingProducts((prev) => !prev)}
            className="border px-4 py-1 rounded"
          >
            {isEditingProducts ? 'キャンセル' : '商品編集'}
          </button>
          {isEditingProducts && (
            <button
              onClick={handleSaveProducts}
              className="border px-4 py-1 rounded bg-green-100"
            >
              保存（商品）
            </button>
          )}
        </div>
        <h2 className="text-lg font-semibold mb-2">📦 商品テーブル</h2>
        <VirtualizedEditableTable
          data={products}
          columns={productColumns}
          isEditing={isEditingProducts}
          dirtyCells={productDirty}
          setDirtyCells={setProductDirty}
        />
      </section>
    </div>
  )
}
