export function getString(data: FormData, key: string): string {
  return ((data.get(key) as string) ?? '').trim()
}

export function getOptionalString(data: FormData, key: string): string | null {
  const val = ((data.get(key) as string) ?? '').trim()
  return val || null
}

export function getOptionalInt(data: FormData, key: string): number | null {
  const raw = getOptionalString(data, key)
  if (!raw) return null
  const n = parseInt(raw, 10)
  return Number.isNaN(n) ? null : n
}

export function getBoolean(data: FormData, key: string): boolean {
  return data.get(key) === 'true'
}
