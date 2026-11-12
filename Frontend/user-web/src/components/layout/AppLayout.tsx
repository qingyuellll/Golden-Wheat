import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Toaster } from '@/components/ui/toast'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
