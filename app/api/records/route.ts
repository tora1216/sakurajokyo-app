import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const salesRepId = searchParams.get('salesRepId')
  const year = searchParams.get('year')

  const db = await readDB()
  let records = db.records

  if (salesRepId) records = records.filter((r) => r.salesRepId === salesRepId)
  if (year) records = records.filter((r) => r.year === Number(year))

  return NextResponse.json(records)
}

export async function POST(request: NextRequest) {
  const { salesRepId, year, month, sales, target } = await request.json()
  const db = await readDB()

  const idx = db.records.findIndex(
    (r) => r.salesRepId === salesRepId && r.year === year && r.month === month
  )
  const record = { salesRepId, year, month, sales, target }

  if (idx >= 0) {
    db.records[idx] = record
  } else {
    db.records.push(record)
  }

  await writeDB(db)
  return NextResponse.json(record)
}
