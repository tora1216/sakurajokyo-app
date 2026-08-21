import { firestore } from './firebase-admin'

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

const DB_DOC = firestore.collection('app-data').doc('db')

export async function readDB(): Promise<DB> {
  const snapshot = await DB_DOC.get()
  const data = snapshot.data()
  return {
    salesReps: data?.salesReps ?? [],
    records: data?.records ?? [],
  }
}

export async function writeDB(db: DB): Promise<void> {
  await DB_DOC.set(db)
}
