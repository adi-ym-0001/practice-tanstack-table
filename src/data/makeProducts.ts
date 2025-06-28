import type { Product } from "./types";

export function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `prd-${i + 1}`,
    name: `商品${i + 1}`,
    price: Math.floor(Math.random() * 10000),
    stock: Math.floor(Math.random() * 500),
    category: ['電子', '食品', '書籍'][i % 3],
    updatedAt: new Date(Date.now() - i * 5000000),
  }))
}
