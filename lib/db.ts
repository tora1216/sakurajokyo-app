import fs from 'fs'
import path from 'path'

export interface SalesRep {
  id: string
  name: string
  email: string
  passwordHash: string
}

export type PublicSalesRep = Omit<SalesRep, 'passwordHash'>

export function toPublicRep(rep: SalesRep): PublicSalesRep {
  const { passwordHash, ...publicRep } = rep
  void passwordHash
  return publicRep
}

export interface SalesRecord {
  salesRepId: string
  year: number
  month: number
  sales: number
  target: number
}

export interface DB {
  salesReps: SalesRep[]
  records: SalesRecord[]
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

export function readDB(): DB {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return { salesReps: [], records: [] }
  }
}

export function writeDB(db: DB): void {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}
