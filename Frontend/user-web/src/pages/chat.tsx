import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { chatApi } from '@/api/chat'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatPage() {
  const isAuth = useAuthStore((s) => s.isAuthenticated())
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  // 流式请求的 AbortController：组件卸载 / 停止按钮用
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 卸载时中断流，防止内存泄漏与跨页面 setState
  useEffect(() => () => abortRef.current?.abort(), [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    // 先放一个空的 assistant 气泡，增量分片直接往里追加（打字机效果）
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    const appendToken = (token: string) => {
      setMessages((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last && last.role === 'assistant') {
          next[next.length - 1] = { ...last, content: last.content + token }
        }
        return next
      })
    }

    try {
      await chatApi.stream(text, appendToken, controller.signal)
    } catch (err) {
      // 用户主动停止不算错误；其余情况把空气泡替换成失败提示
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          const fallback = '抱歉，服务暂时不可用，请稍后再试。'
          if (last && last.role === 'assistant' && last.content === '') {
            next[next.length - 1] = { ...last, content: fallback }
          } else if (!last || last.role !== 'assistant') {
            next.push({ role: 'assistant', content: fallback })
          }
          return next
        })
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, loading])

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  if (!isAuth) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-sm text-muted">请先登录后使用AI客服</p>
      </div>
    )
  }

  // 首个 token 还没到时显示"思考中"，到了之后气泡自己会增长
  const lastMsg = messages[messages.length - 1]
  const waitingFirstToken =
    loading && (!lastMsg || lastMsg.role !== 'assistant' || lastMsg.content === '')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-serif text-lg text-ink mb-6">AI 客服</h1>

      <Card className="chat-container flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4"
        >
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted">有什么可以帮您的？</p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex gap-3',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    msg.role === 'user'
                      ? 'bg-primary-soft text-primary'
                      : 'bg-secondary-soft text-secondary',
                  )}
                >
                  {msg.role === 'user' ? (
                    <User size={16} strokeWidth={1.5} />
                  ) : (
                    <Bot size={16} strokeWidth={1.5} />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-md px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-surface'
                      : 'bg-page text-ink',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {waitingFirstToken && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary-soft text-secondary">
                  <Bot size={16} strokeWidth={1.5} />
                </div>
                <div className="rounded-md bg-page px-3 py-2 text-sm text-muted">
                  思考中...
                </div>
              </div>
            )}
          </div>
        </div>

        <CardContent className="border-t border-line p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="输入您的问题..."
              disabled={loading}
              className="flex-1"
            />
            {loading ? (
              <Button
                size="icon"
                onClick={handleStop}
                aria-label="停止生成"
                variant="secondary"
              >
                <Square size={14} strokeWidth={1.5} />
              </Button>
            ) : (
              <Button
                size="icon"
                disabled={!input.trim()}
                onClick={handleSend}
                aria-label="发送"
              >
                <Send size={16} strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
