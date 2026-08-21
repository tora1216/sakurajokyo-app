import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db'
import { hashPassword, verifyPassword, verifySessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const sessionRepId = token ? await verifySessionToken(token) : null
  if (!sessionRepId || sessionRepId !== id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await request.json()

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
    return NextResponse.json({ error: '新しいパスワードは8文字以上で入力してください' }, { status: 400 })
  }

  const db = await readDB()
  const rep = db.salesReps.find((r) => r.id === id)
  if (!rep) {
    return NextResponse.json({ error: 'メンバーが見つかりません' }, { status: 404 })
  }

  if (!(await verifyPassword(currentPassword, rep.passwordHash))) {
    return NextResponse.json({ error: '現在のパスワードが正しくありません' }, { status: 401 })
  }

  rep.passwordHash = await hashPassword(newPassword)
  await writeDB(db)

  return NextResponse.json({ success: true })
}
