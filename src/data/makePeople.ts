import type { Person } from "./types";

export function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    firstName: `名${i + 1}`,
    lastName: `姓${i + 1}`,
    age: 20 + (i % 30),
    visits: Math.floor(Math.random() * 1000),
    status: ['single', 'complicated', 'relationship'][i % 3],
    progress: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - i * 10000000),
  }))
}
