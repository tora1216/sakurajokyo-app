import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, toPublicRep } from '@/lib/db'
import { randomUUID } from 'crypto'
import { hashPassword, generatePassword } from '@/lib/auth'

export async function GET() {
  const db = readDB()
  return NextResponse.json(db.salesReps.map(toPublicRep))
}

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json()

  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: '名前とメールアドレスを入力してください' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const db = readDB()

  if (db.salesReps.some((r) => r.email.toLowerCase() === normalizedEmail)) {
    return NextResponse.json({ error: 'このメールアドレスは既に使用されています' }, { status: 400 })
  }

  const plainPassword = typeof password === 'string' && password.trim() ? password.trim() : generatePassword()
  const passwordHash = await hashPassword(plainPassword)
  const newRep = { id: randomUUID(), name: name.trim(), email: normalizedEmail, passwordHash }

  db.salesReps.push(newRep)
  writeDB(db)

  return NextResponse.json({ ...toPublicRep(newRep), password: plainPassword }, { status: 201 })
}
