'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SalesRep {
  id: string
  name: string
  email: string
}

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

function generatePassword(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join('')
}

export default function MembersPage() {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [issuedPassword, setIssuedPassword] = useState<{ name: string; email: string; password: string } | null>(null)

  const fetchReps = () =>
    fetch('/api/sales-reps')
      .then((r) => r.json())
      .then(setSalesReps)

  useEffect(() => {
    fetchReps()
  }, [])

  const openAddDialog = () => {
    setNewName('')
    setNewEmail('')
    setNewPassword('')
    setError('')
    setShowAddDialog(true)
  }

  const addRep = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/sales-reps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data?.error ?? '追加に失敗しました')
      setLoading(false)
      return
    }

    setShowAddDialog(false)
    setIssuedPassword({ name: data.name, email: data.email, password: data.password })
    setNewName('')
    setNewEmail('')
    setNewPassword('')
    await fetchReps()
    setLoading(false)
  }

  const deleteRep = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？\nこの担当者の全データも削除されます。`)) return
    await fetch(`/api/sales-reps/${id}`, { method: 'DELETE' })
    await fetchReps()
  }

  const reissuePassword = async (rep: SalesRep) => {
    if (!confirm(`「${rep.name}」のパスワードを再発行しますか？\n現在のパスワードは無効になります。`)) return
    const res = await fetch(`/api/sales-reps/${rep.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regeneratePassword: true }),
    })
    const data = await res.json()
    if (res.ok) {
      setIssuedPassword({ name: rep.name, email: rep.email, password: data.password })
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="bg-brand text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-brand-pale hover:text-white text-sm">
          ← ダッシュボード
        </Link>
        <h1 className="text-xl font-bold">メンバー管理</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        {/* Issued password notice */}
        {issuedPassword && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="font-semibold text-green-800 mb-2">
              {issuedPassword.name} さんのログイン情報
            </div>
            <div className="text-sm text-gray-700 space-y-1 mb-3">
              <div>メールアドレス: <span className="font-mono">{issuedPassword.email}</span></div>
              <div>パスワード: <span className="font-mono font-bold">{issuedPassword.password}</span></div>
            </div>
            <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
              ⚠️ このパスワードは今だけ表示されます。必ずメモしてご本人に伝えてください。
            </div>
            <button
              onClick={() => setIssuedPassword(null)}
              className="text-green-700 hover:text-green-900 text-sm font-medium"
            >
              閉じる
            </button>
          </div>
        )}

        {/* Member list */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              メンバー（{salesReps.length}人）
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={openAddDialog}
                className="bg-brand text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
              >
                + メンバーを追加
              </button>
            </div>
          </div>

          {salesReps.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              メンバーがいません
            </div>
          ) : (
            <ul>
              {salesReps.map((rep, i) => (
                <li
                  key={rep.id}
                  className={`flex items-center justify-between px-6 py-4 gap-3 ${
                    i > 0 ? 'border-t' : ''
                  } hover:bg-gray-50`}
                >
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800">{rep.name}</div>
                    <div className="text-sm text-gray-400 truncate">{rep.email}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => reissuePassword(rep)}
                      className="text-brand hover:text-brand-dark text-sm px-3 py-1 rounded hover:bg-brand-bg transition-colors"
                    >
                      パスワード再発行
                    </button>
                    <button
                      onClick={() => deleteRep(rep.id, rep.name)}
                      className="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Add member dialog */}
      {showAddDialog && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddDialog(false)}
        >
          <div
            className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">新しいメンバーを追加</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">名前</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="田中 太郎"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="tanaka@example.com"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">パスワード</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="パスワードを入力"
                    className="flex-1 min-w-0 border rounded-lg px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-border"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPassword(generatePassword())}
                    className="shrink-0 border border-brand text-brand px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-bg transition-colors"
                  >
                    自動生成
                  </button>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 border rounded-lg py-2 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={addRep}
                  disabled={!newName.trim() || !newEmail.trim() || !newPassword.trim() || loading}
                  className="flex-1 bg-brand text-white py-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 font-medium transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
