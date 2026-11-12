import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Toaster } from '@/components/ui/toast'
import { connectOrderWebSocket, disconnectOrderWebSocket } from '@/lib/websocket'

/** 应用外壳：左侧栏 + 顶栏 + 内容区 + 来单提醒 WebSocket */
export function AppLayout() {
  useEffect(() => {
    connectOrderWebSocket()
    return () => disconnectOrderWebSocket()
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-page">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
