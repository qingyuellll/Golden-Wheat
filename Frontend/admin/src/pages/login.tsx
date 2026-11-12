import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wheat, User, Lock, Loader2 } from 'lucide-react'
import { employeeApi } from '@/api/employee'
import { useAuthStore } from '@/store/auth'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** 登录页：洛可可温室双栏 · 装饰性浅腮红 + 极简登录卡 */
export function LoginPage() {
  const navigate = useNavigate()
  const setLogin = useAuthStore((s) => s.setLogin)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('请输入账号与密码')
      return
    }
    setLoading(true)
    try {
      const { token, id, userName, name } = await employeeApi.login({ username, password })
      setLogin({ token, id, userName, name })
      toast.success(`欢迎回来，${name}`)
      navigate('/dashboard', { replace: true })
    } catch {
      // 拦截器已提示
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-page">
      {/* 左 · 装饰栏（浅腮红，洛可可温室意象） */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-bg p-12 md:flex">
        <div className="absolute -right-16 top-16 opacity-30">
          <LeafCluster />
        </div>
        <div className="absolute -left-8 bottom-8 opacity-40">
          <LeafCluster />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Wheat size={20} strokeWidth={1.5} className="text-accent" />
          </div>
          <span className="font-serif text-lg text-primary-ink">麦子熟了 Golden Wheat</span>
        </div>

        <div className="relative">
          <p className="font-serif text-xl text-primary-ink">管理端</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-primary-ink">
            洛可可温室
            <br />
            植物研究所
          </h1>
          <p className="mt-4 max-w-md text-base text-secondary-ink">
            以植物舒展之姿，统理后厨与商铺——温润、克制、留白。
          </p>
        </div>

        <p className="relative text-xs text-secondary-ink/70">
          © 2026 Golden Wheat · Rococo Greenhouse Admin
        </p>
      </aside>

      {/* 右 · 登录卡 */}
      <main className="flex w-full flex-col items-center justify-center px-6 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                <Wheat size={20} strokeWidth={1.5} className="text-accent" />
              </div>
              <span className="font-serif text-lg text-ink">麦子熟了管理端</span>
            </div>
          </div>

          <h2 className="font-serif text-xl text-ink">欢迎登录</h2>
          <p className="mt-1 text-sm text-muted">使用员工账号进入管理后台</p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User
                  size={16}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <Input
                  id="username"
                  className="pl-9"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock
                  size={16}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="mt-2">
              {loading && <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />}
              {loading ? '登录中…' : '登录'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            演示账号 admin / 123456
          </p>
        </div>
      </main>
    </div>
  )
}

/** 装饰：叶簇 SVG（细线条，无渐变） */
function LeafCluster() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#4F6035" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M110 30 C 80 60, 70 100, 110 130" />
        <path d="M110 30 C 140 60, 150 100, 110 130" />
        <path d="M110 130 L 110 200" />
        <path d="M60 80 C 70 95, 80 100, 95 95" />
        <path d="M160 80 C 150 95, 140 100, 125 95" />
        <path d="M70 140 C 85 150, 95 152, 105 145" />
        <path d="M150 140 C 135 150, 125 152, 115 145" />
        <circle cx="95" cy="95" r="2" fill="#E7E57C" stroke="none" />
        <circle cx="125" cy="95" r="2" fill="#E7E57C" stroke="none" />
        <circle cx="105" cy="145" r="2" fill="#F0BEB7" stroke="none" />
        <circle cx="115" cy="145" r="2" fill="#F0BEB7" stroke="none" />
      </g>
    </svg>
  )
}
