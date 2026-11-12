import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/store/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const handleSendCode = useCallback(async () => {
    if (!/^1\d{10}$/.test(phone.trim())) {
      toast.error('请输入正确的手机号')
      return
    }
    setSending(true)
    try {
      await userApi.sendCode(phone.trim())
      toast.success('验证码已发送')
      setCountdown(60)
    } catch {
      toast.error('发送失败，请稍后重试')
    } finally {
      setSending(false)
    }
  }, [phone])

  const handleLogin = useCallback(async () => {
    if (!/^1\d{10}$/.test(phone.trim())) {
      toast.error('请输入正确的手机号')
      return
    }
    if (!code.trim()) {
      toast.error('请输入验证码')
      return
    }
    setLoading(true)
    try {
      const res = await userApi.webLogin({ phone: phone.trim(), code: code.trim() })
      login(res.token, res.refreshToken, res.id)
      toast.success('登录成功')
      navigate('/', { replace: true })
    } catch {
      toast.error('登录失败，请检查验证码')
    } finally {
      setLoading(false)
    }
  }, [phone, code, login, navigate])

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-6">
        <h2 className="font-serif text-lg text-ink text-center mb-6">登录</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm text-ink font-medium">
              手机号
            </label>
            <div className="relative">
              <Phone
                size={16}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="text-sm text-ink font-medium">
              验证码
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ShieldCheck
                  size={16}
                  strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <Input
                  id="code"
                  type="text"
                  placeholder="请输入验证码"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="md"
                disabled={countdown > 0 || sending}
                onClick={handleSendCode}
                className="shrink-0 min-w-[100px]"
              >
                {countdown > 0 ? `${countdown}s` : sending ? '发送中' : '获取验证码'}
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            disabled={loading}
            onClick={handleLogin}
            className="mt-2 w-full"
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </CardContent>
    </Card>
  )
}
