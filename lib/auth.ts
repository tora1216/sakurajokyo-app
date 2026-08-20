// Uses Web Crypto (crypto.subtle) so this works in both the Node.js API
// routes and the Edge middleware runtime without extra dependencies.

const encoder = new TextEncoder()
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-me'
// 400 days is the practical maximum a browser will honor for a cookie,
// so this is as close to "valid until logout" as a persistent cookie gets.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 400
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000
export const SESSION_COOKIE = 'sales_session'

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(password, salt)
  return `${toHex(salt)}:${toHex(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const hash = await pbkdf2(password, fromHex(saltHex))
  return timingSafeEqual(toHex(hash), hashHex)
}

// Avoids visually ambiguous characters (0/O, 1/I/l).
const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

export function generatePassword(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join('')
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return toHex(sig)
}

export async function createSessionToken(salesRepId: string): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE_MS
  const payload = `${salesRepId}.${expires}`
  const sig = await hmac(payload)
  return `${payload}.${sig}`
}

export async function verifySessionToken(token: string): Promise<string | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [salesRepId, expiresStr, sig] = parts
  const expected = await hmac(`${salesRepId}.${expiresStr}`)
  if (!timingSafeEqual(expected, sig)) return null
  if (!Number.isFinite(Number(expiresStr)) || Date.now() > Number(expiresStr)) return null
  return salesRepId
}
