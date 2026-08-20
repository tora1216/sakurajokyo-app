import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

function checkAdminAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Basic ')) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    })
  }

  const base64 = authHeader.slice(6)
  const decoded = atob(base64)
  const colonIndex = decoded.indexOf(':')
  const username = decoded.slice(0, colonIndex)
  const password = decoded.slice(colonIndex + 1)

  const adminUser = process.env.ADMIN_USER ?? 'admin'
  const adminPass = process.env.ADMIN_PASS ?? 'admin1234'

  if (username !== adminUser || password !== adminPass) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    })
  }

  return null
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const denied = checkAdminAuth(request)
    if (denied) return denied
    return NextResponse.next()
  }

  // /sales itself is the login page and stays open.
  if (pathname === '/sales') {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    const salesRepId = token ? await verifySessionToken(token) : null
    if (salesRepId) {
      return NextResponse.redirect(new URL(`/sales/${salesRepId}`, request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/sales/')) {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    const salesRepId = token ? await verifySessionToken(token) : null

    if (!salesRepId) {
      return NextResponse.redirect(new URL('/sales', request.url))
    }

    const requestedId = pathname.split('/')[2]
    if (requestedId && requestedId !== salesRepId) {
      return NextResponse.redirect(new URL(`/sales/${salesRepId}`, request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/sales', '/sales/:path*'],
}
