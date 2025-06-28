import type { Person } from "./types"

const statuses = ['single', 'relationship', 'complicated']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function makeData(count = 10000): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i.toString(),
    firstName: `名${randomInt(1, 99)}`,
    lastName: `姓${randomInt(1, 99)}`,
    age: randomInt(18, 60),
    visits: randomInt(1, 100),
    status: statuses[randomInt(0, statuses.length - 1)],
    progress: randomInt(0, 100),
    createdAt: new Date(Date.now() - randomInt(0, 1e9) * 1000),
  }))
}
