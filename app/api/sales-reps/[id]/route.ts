import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db'
import { hashPassword, generatePassword } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { regeneratePassword } = await request.json()

  const db = await readDB()
  const rep = db.salesReps.find((r) => r.id === id)
  if (!rep) {
    return NextResponse.json({ error: 'メンバーが見つかりません' }, { status: 404 })
  }

  if (!regeneratePassword) {
    return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  const plainPassword = generatePassword()
  rep.passwordHash = await hashPassword(plainPassword)
  await writeDB(db)

  return NextResponse.json({ password: plainPassword })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = await readDB()
  db.salesReps = db.salesReps.filter((r) => r.id !== id)
  db.records = db.records.filter((r) => r.salesRepId !== id)
  await writeDB(db)
  return NextResponse.json({ success: true })
}
