import * as React from 'react'
import { create } from 'zustand'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastStore {
  toasts: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => void
  dismiss: (id: number) => void
}

let seed = 0

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => ({ toasts: [...s.toasts, { ...t, id: ++seed }] })),
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'error' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'info' }),
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: 'text-primary',
  error: 'text-danger',
  info: 'text-muted',
}

function ToastCard({ toast: item }: { toast: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const Icon = ICONS[item.variant]

  React.useEffect(() => {
    const timer = window.setTimeout(() => dismiss(item.id), 3200)
    return () => window.clearTimeout(timer)
  }, [item.id, dismiss])

  return (
    <div
      className={cn(
        'card-border flex w-80 items-start gap-3 rounded-md bg-surface p-4',
        'animate-slide-in-right',
      )}
      role="status"
    >
      <Icon size={18} strokeWidth={1.5} className={cn('mt-0.5 shrink-0', VARIANT_CLASS[item.variant])} />
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{item.title}</p>
        {item.description && (
          <p className="mt-1 text-xs text-muted">{item.description}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(item.id)}
        className="rounded-sm p-1 text-muted transition-all duration-300 hover:bg-primary-soft hover:text-primary"
        aria-label="关闭通知"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed right-6 top-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>,
    document.body,
  )
}
