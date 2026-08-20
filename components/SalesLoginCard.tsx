'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SalesLoginCard() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const openDialog = () => {
    setEmail('')
    setPassword('')
    setError('')
    setOpen(true)
  }

  const login = async () => {
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'ログインに失敗しました')
      setLoading(false)
      return
    }

    const { id } = await res.json()
    router.push(`/sales/${id}`)
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="bg-white hover:bg-brand-bg text-brand border-2 border-brand-border rounded-2xl px-10 py-8 text-center shadow-lg transition-all hover:scale-105"
      >
        <div className="text-3xl mb-2">📊</div>
        <div className="text-xl font-bold">営業担当</div>
        <div className="text-brand-secondary text-sm mt-1">実績・目標の入力</div>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">営業担当ログイン</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && login()}
                  placeholder="you@example.com"
                  autoComplete="username"
                  autoFocus
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && login()}
                  autoComplete="current-password"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 border rounded-lg py-2 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={login}
                  disabled={loading || !email.trim() || !password}
                  className="flex-1 bg-brand text-white py-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 font-medium transition-colors"
                >
                  {loading ? 'ログイン中...' : 'ログイン'}
                </button>
              </div>
            </div>

            <p className="text-center text-gray-400 text-xs mt-4">
              ログイン情報が分からない場合は管理者に連絡してください。
            </p>
          </div>
        </div>
      )}
    </>
  )
}
