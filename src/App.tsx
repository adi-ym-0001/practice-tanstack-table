import { useState } from 'react'
import { makePeople } from './data/makePeople'
import { makeProducts } from './data/makeProducts'

import { SectionContainer } from './components/SectionContainer'

import { getPersonColumns } from './features/people/columns'
import { stylePersonCell } from './features/people/renderCell'

import { ReadonlyTable } from './components/ReadonlyTable'
import type { Person, Product } from './data/types'
import { getProductColumns } from './features/products/columns'
import { styleProductCell } from './features/products/renderCell'

// 各セクションをまとめる画面のエントリーポイント。データ生成・状態管理・3つのテーブル表示を担う
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

  const peopleIn30s = people.filter((p) => p.age >= 30 && p.age < 40)

  return (
    <div className="p-6 space-y-12">
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
        renderCell={stylePersonCell}
      />

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
        renderCell={styleProductCell}
      />

      <ReadonlyTable
        title="🧑‍💼 30代ユーザー一覧（表示専用）"
        data={peopleIn30s}
        columns={getPersonColumns(false)}
        renderCell={stylePersonCell}
      />
    </div>
  )
}
