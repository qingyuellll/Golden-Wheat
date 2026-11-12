import { toast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/auth'

/** 后端 WebSocket 推送的消息结构（type: 1来单提醒 2催单提醒） */
export interface OrderRemindMessage {
  type: 1 | 2
  orderId: number
  content: string
}

/** 来单/催单提醒事件名，订单页监听后刷新列表 */
export const ORDER_REMIND_EVENT = 'gw:order-remind'

const RECONNECT_BASE_DELAY = 5000
const RECONNECT_MAX_DELAY = 60000

let socket: WebSocket | null = null
let retryTimer: ReturnType<typeof setTimeout> | null = null
let retryDelay = RECONNECT_BASE_DELAY

/**
 * 建立来单提醒长连接（带管理端 JWT 鉴权与指数退避重连）
 * 在 AppLayout 挂载时调用，登出/卸载时调用 disconnectOrderWebSocket
 */
export function connectOrderWebSocket(): void {
  const token = useAuthStore.getState().token
  if (!token || socket) return

  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const sid = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  const url = `${proto}://${window.location.host}/ws/${sid}?token=${encodeURIComponent(token)}`

  socket = new WebSocket(url)

  socket.onopen = () => {
    retryDelay = RECONNECT_BASE_DELAY
  }

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data as string) as OrderRemindMessage
      if (msg.type === 1) {
        toast.info(`来单提醒：${msg.content}`)
      } else if (msg.type === 2) {
        toast.info(`催单提醒：${msg.content}`)
      } else {
        return
      }
      window.dispatchEvent(new CustomEvent<OrderRemindMessage>(ORDER_REMIND_EVENT, { detail: msg }))
    } catch {
      // 忽略无法解析的服务端消息
    }
  }

  socket.onclose = () => {
    socket = null
    // 未授权（token 失效）时后端会立即关闭连接；未登录时 connect 直接返回，重连自然停止
    retryTimer = setTimeout(connectOrderWebSocket, retryDelay)
    retryDelay = Math.min(retryDelay * 2, RECONNECT_MAX_DELAY)
  }

  socket.onerror = () => {
    socket?.close()
  }
}

/** 断开来单提醒连接并停止重连（登出/组件卸载时调用） */
export function disconnectOrderWebSocket(): void {
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
  retryDelay = RECONNECT_BASE_DELAY
  if (socket) {
    socket.onclose = null
    socket.close()
    socket = null
  }
}
