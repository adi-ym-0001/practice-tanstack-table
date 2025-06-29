// React の useState をインポート
import { useState } from 'react'

// セクションごとのテーブル UI コンテナ
import { SectionContainer } from './components/SectionContainer'

// デモ用の人と商品データを生成する関数
import { makePeople } from './data/makePeople'
import { makeProducts } from './data/makeProducts'

// Person, Product 型定義
import type { Person, Product } from './data/types'

// 人テーブルのカラム定義・セルスタイル関数
import { getPersonColumns } from './features/peaple/columns'
import { stylePersonCell } from './features/peaple/renderCell'

// 商品テーブルのカラム定義・セルスタイル関数
import { getProductColumns } from './features/products/columns'
import { styleProductCell } from './features/products/renderCell'

export default function App() {
  // 初期データを生成して useState にセット（人5000人、商品3000点）
  const [people, setPeople] = useState(() => makePeople(5000))
  const [products, setProducts] = useState(() => makeProducts(3000))

  // 各テーブルの編集モード状態
  const [isEditingPeople, setIsEditingPeople] = useState(false)
  const [isEditingProducts, setIsEditingProducts] = useState(false)

  // パッケージ生成モード（チェック表示）の ON/OFF
  const [showPeopleCheckbox, setShowPeopleCheckbox] = useState(false)
  const [showProductsCheckbox, setShowProductsCheckbox] = useState(false)

  // 編集中のセル（dirty なフィールド）を管理
  const [peopleDirty, setPeopleDirty] = useState<Record<string, Partial<Person>>>({})
  const [productDirty, setProductDirty] = useState<Record<string, Partial<Product>>>({})

  // チェックボックスによる選択状態
  const [peopleSelection, setPeopleSelection] = useState<Record<string, boolean>>({})
  const [productSelection, setProductSelection] = useState<Record<string, boolean>>({})

  return (
    <div className="p-6 space-y-12">
      {/* 👤 人テーブルセクション */}
      <SectionContainer
        title="👤 ユーザーテーブル"
        data={people}
        setData={setPeople}
        columns={getPersonColumns(showPeopleCheckbox)} // パッケージ生成モード時は一部列を非表示
        isEditing={isEditingPeople}
        setIsEditing={setIsEditingPeople}
        dirtyCells={peopleDirty}
        setDirtyCells={setPeopleDirty}
        rowSelection={peopleSelection}
        setRowSelection={setPeopleSelection}
        showCheckbox={showPeopleCheckbox}
        setShowCheckbox={setShowPeopleCheckbox}
        renderCell={stylePersonCell} // 年齢が30代のとき Age セルに背景色
      />

      {/* 🛒 商品テーブルセクション */}
      <SectionContainer
        title="🛒 商品テーブル"
        data={products}
        setData={setProducts}
        columns={getProductColumns(showProductsCheckbox)} // パッケージ生成モード時にID等を非表示
        isEditing={isEditingProducts}
        setIsEditing={setIsEditingProducts}
        dirtyCells={productDirty}
        setDirtyCells={setProductDirty}
        rowSelection={productSelection}
        setRowSelection={setProductSelection}
        showCheckbox={showProductsCheckbox}
        setShowCheckbox={setShowProductsCheckbox}
        renderCell={styleProductCell} // 在庫が0なら Stock セルを赤く表示
      />
    </div>
  )
}
