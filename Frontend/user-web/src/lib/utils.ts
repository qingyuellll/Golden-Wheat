import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return '—'
  return `¥${num.toFixed(2)}`
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return numFormat.format(value)
}

const numFormat = new Intl.NumberFormat('zh-CN')

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function stringifyJsonArray(arr: string[]): string {
  return JSON.stringify(arr.filter(Boolean))
}

/**
 * 把 input[type=datetime-local] 的值（2026-11-11T16:30）转成后端约定的
 * yyyy-MM-dd HH:mm:ss。空值返回 undefined，表示"未指定"。
 */
export function toDateTimeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const [datePart, timePart = '00:00'] = String(value).replace(' ', 'T').split('T')
  if (!datePart) return undefined
  const [hour = '00', minute = '00', second = '00'] = timePart.split(':')
  return `${datePart} ${hour}:${minute}:${second.slice(0, 2)}`
}

/** 把后端返回的 yyyy-MM-dd HH:mm:ss 转成 input[type=datetime-local] 需要的格式 */
export function toDateTimeInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const [datePart, timePart = ''] = String(value).replace(' ', 'T').split('T')
  return timePart ? `${datePart}T${timePart.slice(0, 5)}` : datePart
}
