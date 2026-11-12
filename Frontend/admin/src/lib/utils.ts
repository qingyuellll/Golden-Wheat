import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn: 合并 className，解决 Tailwind 类冲突。
 * 所有组件统一走 cn，禁止字符串拼接 className。
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** 金额分 → 元（后端 BigDecimal 已是元，这里仅做安全格式化） */
export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return '—'
  return `¥${num.toFixed(2)}`
}

/** 数值千分位 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return numFormat.format(value)
}

const numFormat = new Intl.NumberFormat('zh-CN')

/** 日期时间：yyyy-MM-dd HH:mm:ss */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 日期：yyyy-MM-dd */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 后端逗号分隔字符串 → 数组 */
export function splitCsv(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

/** 后端 JSON 数组字符串（如口味 value）→ 数组 */
export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/** 数组 → 后端 JSON 数组字符串 */
export function stringifyJsonArray(arr: string[]): string {
  return JSON.stringify(arr.filter(Boolean))
}

/**
 * input[type=datetime-local] 的值（2026-11-11T16:30）→ 后端约定的 yyyy-MM-dd HH:mm:ss。
 * 空值返回 undefined，表示未设置。
 */
export function toDateTimeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const [datePart, timePart = '00:00'] = String(value).replace(' ', 'T').split('T')
  if (!datePart) return undefined
  const [hour = '00', minute = '00', second = '00'] = timePart.split(':')
  return `${datePart} ${hour}:${minute}:${second.slice(0, 2)}`
}

/** 后端 yyyy-MM-dd HH:mm:ss → input[type=datetime-local] 需要的格式（回显用） */
export function toDateTimeInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const [datePart, timePart = ''] = String(value).replace(' ', 'T').split('T')
  return timePart ? `${datePart}T${timePart.slice(0, 5)}` : datePart
}
