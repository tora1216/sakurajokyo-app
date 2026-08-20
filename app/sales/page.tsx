'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SalesLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen bg-brand-bg">
      <header className="bg-brand text-white px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-brand-pale hover:text-white text-sm">
          ← ホーム
        </Link>
        <h1 className="text-xl font-bold">🌸 営業担当ログイン</h1>
      </header>

      <main className="p-6 max-w-sm mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
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

            <button
              onClick={login}
              disabled={loading || !email.trim() || !password}
              className="w-full bg-brand text-white py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          ログイン情報が分からない場合は管理者に連絡してください。
        </p>
      </main>
    </div>
  )
}
