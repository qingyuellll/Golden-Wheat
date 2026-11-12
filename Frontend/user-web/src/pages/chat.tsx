import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User } from 'lucide-react'
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const answer = await chatApi.send(text)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，服务暂时不可用，请稍后再试。' },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  if (!isAuth) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-sm text-muted">请先登录后使用AI客服</p>
      </div>
    )
  }

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
            {loading && (
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
            <Button
              size="icon"
              disabled={loading || !input.trim()}
              onClick={handleSend}
              aria-label="发送"
            >
              <Send size={16} strokeWidth={1.5} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
