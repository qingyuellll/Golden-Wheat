import { Outlet } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { Toaster } from '@/components/ui/toast'

export function AuthLayout() {
  return (
    <div className="paper-texture flex min-h-screen items-center justify-center bg-page">
      <div className="flex w-full max-w-md flex-col items-center gap-8 px-4">
        <div className="flex flex-col items-center gap-2">
          <Leaf size={40} strokeWidth={1.5} className="text-primary" />
          <h1 className="font-serif text-lg text-ink">金麦</h1>
          <p className="text-sm text-muted">自然之味，用心烹饪</p>
        </div>
        <Outlet />
      </div>
      <Toaster />
    </div>
  )
}
