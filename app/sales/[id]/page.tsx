'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MonthlyChart } from '@/components/MonthlyChart'

interface SalesRep {
  id: string
  name: string
}

interface SalesRecord {
  salesRepId: string
  year: number
  month: number
  sales: number
  target: number
}

function AchievementBadge({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-gray-400">―</span>
  const color =
    rate >= 100
      ? 'bg-green-100 text-green-700'
      : rate >= 80
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {rate.toFixed(1)}%
    </span>
  )
}

export default function SalesRepPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [rep, setRep] = useState<SalesRep | null>(null)
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [salesInput, setSalesInput] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const [records, setRecords] = useState<SalesRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const fetchData = useCallback(async () => {
    const [repsRes, recordsRes] = await Promise.all([
      fetch('/api/sales-reps'),
      fetch(`/api/records?salesRepId=${id}&year=${year}`),
    ])
    const reps: SalesRep[] = await repsRes.json()
    const recs: SalesRecord[] = await recordsRes.json()
    setRep(reps.find((r) => r.id === id) ?? null)
    setRecords(recs)
  }, [id, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Pre-fill form when month or records change
  useEffect(() => {
    const existing = records.find((r) => r.month === month)
    if (existing) {
      setSalesInput(existing.sales.toString())
      setTargetInput(existing.target.toString())
    } else {
      setSalesInput('')
      setTargetInput('')
    }
  }, [month, records])

  const save = async () => {
    if (!salesInput && !targetInput) return
    setSaving(true)
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salesRepId: id,
        year,
        month,
        sales: Number(salesInput) || 0,
        target: Number(targetInput) || 0,
      }),
    })
    await fetchData()
    setSaving(false)
    setSavedMsg('保存しました ✓')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/sales')
  }

  const totalSales = records.reduce((sum, r) => sum + r.sales, 0)
  const totalTarget = records.reduce((sum, r) => sum + r.target, 0)
  const yearRate = totalTarget > 0 ? (totalSales / totalTarget) * 100 : null

  const currentMonthRec = year === currentYear ? records.find((r) => r.month === currentMonth) : null
  const currentMonthRemaining = currentMonthRec
    ? Math.max(0, currentMonthRec.target - currentMonthRec.sales)
    : null
  const currentMonthRate = currentMonthRec && currentMonthRec.target > 0
    ? (currentMonthRec.sales / currentMonthRec.target) * 100
    : null

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const rec = records.find((r) => r.month === m)
    return {
      month: `${m}月`,
      sales: rec?.sales ?? 0,
      target: rec?.target ?? 0,
    }
  })

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i)

  if (!rep) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="bg-brand text-white px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-brand-pale hover:text-white text-sm">
            ← ホーム
          </Link>
          <h1 className="text-xl font-bold">🌸 {rep.name}</h1>
        </div>
        <button
          onClick={logout}
          className="text-brand-pale hover:text-white text-sm"
        >
          ログアウト
        </button>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Year selector */}
        <div className="mb-6 flex items-center gap-3">
          <span className="font-medium text-gray-700">年度:</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-border"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </div>

        {/* Current month progress banner */}
        {year === currentYear && currentMonthRec && (
          <div className={`rounded-xl p-5 mb-6 shadow-sm ${
            currentMonthRate !== null && currentMonthRate >= 100
              ? 'bg-green-50 border border-green-200'
              : 'bg-white border border-brand-border'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-700">
                {currentMonth}月の進捗
              </div>
              {currentMonthRate !== null && currentMonthRate >= 100 ? (
                <span className="text-green-600 font-bold text-sm">🎉 目標達成！</span>
              ) : currentMonthRemaining !== null && currentMonthRemaining > 0 ? (
                <span className="text-brand font-bold text-sm">
                  あと {Math.round(currentMonthRemaining / 10000)}万円で達成
                </span>
              ) : null}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${
                  currentMonthRate !== null && currentMonthRate >= 100
                    ? 'bg-green-500'
                    : currentMonthRate !== null && currentMonthRate >= 80
                    ? 'bg-yellow-400'
                    : 'bg-brand'
                }`}
                style={{ width: `${Math.min(100, currentMonthRate ?? 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>実績 {Math.round(currentMonthRec.sales / 10000)}万円</span>
              <span>{currentMonthRate !== null ? `${currentMonthRate.toFixed(1)}%` : '―'}</span>
              <span>目標 {Math.round(currentMonthRec.target / 10000)}万円</span>
            </div>
          </div>
        )}
        {year === currentYear && !currentMonthRec && (
          <div className="rounded-xl p-4 mb-6 bg-yellow-50 border border-yellow-200 text-sm text-yellow-700">
            ⚠️ {currentMonth}月のデータがまだ入力されていません
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="text-sm text-gray-500">年間実績</div>
            <div className="text-xl font-bold text-gray-800">
              {Math.round(totalSales / 10000)}万円
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="text-sm text-gray-500">年間目標</div>
            <div className="text-xl font-bold text-gray-800">
              {Math.round(totalTarget / 10000)}万円
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="text-sm text-gray-500">年間達成率</div>
            <div
              className={`text-xl font-bold ${
                yearRate === null
                  ? 'text-gray-400'
                  : yearRate >= 100
                  ? 'text-green-600'
                  : yearRate >= 80
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {yearRate !== null ? `${yearRate.toFixed(1)}%` : '―'}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input form */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">実績・目標を入力</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">月を選択</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}月
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">目標（円）</label>
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="2000000"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">実績（円）</label>
                <input
                  type="number"
                  value={salesInput}
                  onChange={(e) => setSalesInput(e.target.value)}
                  placeholder="1800000"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>

              <button
                onClick={save}
                disabled={saving || (!salesInput && !targetInput)}
                className="w-full bg-brand text-white py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 font-medium transition-colors"
              >
                {saving ? '保存中...' : '保存する'}
              </button>

              {savedMsg && (
                <div className="text-center text-green-600 text-sm font-medium">
                  {savedMsg}
                </div>
              )}
            </div>
          </div>

          {/* Monthly table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">月別一覧</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-sm text-gray-600 font-medium">月</th>
                  <th className="text-right px-4 py-2 text-sm text-gray-600 font-medium">目標</th>
                  <th className="text-right px-4 py-2 text-sm text-gray-600 font-medium">実績</th>
                  <th className="text-right px-4 py-2 text-sm text-gray-600 font-medium">達成率</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 12 }, (_, i) => {
                  const m = i + 1
                  const rec = records.find((r) => r.month === m)
                  const mRate =
                    rec && rec.target > 0 ? (rec.sales / rec.target) * 100 : null
                  return (
                    <tr
                      key={m}
                      className={`border-t text-sm cursor-pointer transition-colors ${
                        m === month ? 'bg-brand-bg' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setMonth(m)}
                    >
                      <td className="px-4 py-2 font-medium">{m}月</td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {rec ? `${Math.round(rec.target / 10000)}万` : '―'}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {rec ? `${Math.round(rec.sales / 10000)}万` : '―'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <AchievementBadge rate={mRate} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">月次推移</h2>
          <MonthlyChart data={monthlyData} />
        </div>
      </main>
    </div>
  )
}
