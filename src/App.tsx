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
  // 🧑‍🤝‍🧑 初期データ生成
  const [people, setPeople] = useState(() => makePeople(5000))
  const [products, setProducts] = useState(() => makeProducts(3000))

  // ✏️ 編集モードの ON/OFF
  const [isEditingPeople, setIsEditingPeople] = useState(false)
  const [isEditingProducts, setIsEditingProducts] = useState(false)

  // ✅ チェック列（割当モード）の表示制御
  const [showPeopleCheckbox, setShowPeopleCheckbox] = useState(false)
  const [showProductsCheckbox, setShowProductsCheckbox] = useState(false)

  // 🧼 編集中の差分管理（ID ごとの部分更新）
  const [peopleDirty, setPeopleDirty] = useState<Record<string, Partial<Person>>>({})
  const [productDirty, setProductDirty] = useState<Record<string, Partial<Product>>>({})

  // 📦 行の選択状態（割当対象）
  const [peopleSelection, setPeopleSelection] = useState<Record<string, boolean>>({})
  const [productSelection, setProductSelection] = useState<Record<string, boolean>>({})

  // 🧑‍💼 30代ユーザーのみ抽出（表示専用に利用）
  const peopleIn30s = people.filter((p) => p.age >= 30 && p.age < 40)

  return (
    <div className="p-6 space-y-12">
      {/* 🧑‍🧑 編集・割当・フィルタ対応の「ユーザーテーブル」 */}
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

      {/* 🛒 編集・割当・フィルタ対応の「商品テーブル」 */}
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

      {/* 📖 表示・フィルターのみの「30代ユーザー一覧」 */}
      <ReadonlyTable
        title="🧑‍💼 30代ユーザー一覧（表示専用）"
        data={peopleIn30s}
        columns={getPersonColumns(false)}
        renderCell={stylePersonCell}
      />
    </div>
  )
}