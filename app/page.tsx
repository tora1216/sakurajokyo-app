import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { SalesLoginCard } from '@/components/SalesLoginCard'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const salesRepId = token ? await verifySessionToken(token) : null

  return (
    <main className="min-h-screen bg-brand-bg flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <Image src="/logo.png" alt="桜上居株式会社" width={96} height={96} className="mx-auto mb-4" priority />
        <h1 className="text-4xl font-bold text-brand mb-3">桜上居株式会社 営業管理</h1>
        <p className="text-gray-500 text-lg">営業成績・目標管理システム</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full px-4 sm:px-0 sm:w-auto">
        <Link
          href="/admin"
          prefetch={false}
          className="bg-brand hover:bg-brand-dark text-white rounded-2xl px-10 py-8 text-center shadow-lg transition-all hover:scale-105"
        >
          <div className="text-3xl mb-2">👔</div>
          <div className="text-xl font-bold">管理者</div>
          <div className="text-brand-pale text-sm mt-1">全体の集計・確認</div>
        </Link>

        {salesRepId ? (
          <Link
            href={`/sales/${salesRepId}`}
            className="bg-white hover:bg-brand-bg text-brand border-2 border-brand-border rounded-2xl px-10 py-8 text-center shadow-lg transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-xl font-bold">営業担当</div>
            <div className="text-brand-secondary text-sm mt-1">実績・目標の入力</div>
          </Link>
        ) : (
          <SalesLoginCard />
        )}
      </div>
    </main>
  )
}
