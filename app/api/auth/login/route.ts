import { NextRequest, NextResponse } from 'next/server'
import { readDB } from '@/lib/db'
import { createSessionToken, verifyPassword, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 })
  }

  const db = readDB()
  const rep = db.salesReps.find((r) => r.email.toLowerCase() === email.trim().toLowerCase())

  if (!rep || !(await verifyPassword(password, rep.passwordHash))) {
    return NextResponse.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 })
  }

  const token = await createSessionToken(rep.id)
  const response = NextResponse.json({ id: rep.id, name: rep.name })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
