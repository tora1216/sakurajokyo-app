'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function SalesSettingsPage() {
  const params = useParams()
  const id = params.id as string

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const changePassword = async () => {
    setError('')
    setSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) return

    if (newPassword.length < 8) {
      setError('新しいパスワードは8文字以上で入力してください')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードが一致しません')
      return
    }

    setSaving(true)
    const res = await fetch(`/api/sales-reps/${id}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'パスワードの変更に失敗しました')
      setSaving(false)
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setSuccess(true)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="bg-brand text-white px-6 py-4 flex items-center gap-4">
        <Link href={`/sales/${id}`} className="text-brand-pale hover:text-white text-sm">
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold">設定</h1>
      </header>

      <main className="p-6 max-w-sm mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h2 className="text-lg font-semibold mb-4">パスワードを変更</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">現在のパスワード</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">新しいパスワード</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">新しいパスワード（確認）</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && changePassword()}
                autoComplete="new-password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm font-medium">パスワードを変更しました ✓</div>}

            <button
              onClick={changePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-brand text-white py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 font-medium transition-colors"
            >
              {saving ? '変更中...' : 'パスワードを変更する'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
