import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  KeyRound,
  LogOut,
  Store,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { shopApi } from '@/api/shop'
import { employeeApi } from '@/api/employee'
import { toast } from '@/components/ui/toast'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NAV_GROUPS } from './nav-config'

/** 顶栏：当前页标题（从 nav 配置反查） + 商铺状态开关 + 用户菜单 */
export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const employee = useAuthStore((s) => s.employee)
  const clear = useAuthStore((s) => s.clear)

  const [shopOn, setShopOn] = useState(true)
  const [pwdOpen, setPwdOpen] = useState(false)

  // 当前页标题
  const flat = NAV_GROUPS.flatMap((g) => g.items)
  const current = flat.find((i) => location.pathname.startsWith(i.to))
  const title = current?.label ?? '工作台'

  useEffect(() => {
    shopApi.getStatus().then((s) => setShopOn(s === 1)).catch(() => {})
  }, [])

  const toggleShop = async (on: boolean) => {
    try {
      await shopApi.setStatus(on ? 1 : 0)
      setShopOn(on)
      toast.success(on ? '已开门营业' : '已打烊休息')
    } catch {
      // 拦截器已提示
    }
  }

  const logout = async () => {
    try {
      await employeeApi.logout()
    } catch {
      // 忽略后端错误，前端照常清理
    }
    clear()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/95 px-8 backdrop-blur-0">
      <div>
        <h2 className="font-serif text-lg text-ink">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {shopOn ? (
            <Sun size={16} strokeWidth={1.5} className="text-primary" />
          ) : (
            <Moon size={16} strokeWidth={1.5} className="text-muted" />
          )}
          <span className="text-sm text-muted">{shopOn ? '营业中' : '已打烊'}</span>
          <Switch checked={shopOn} onCheckedChange={toggleShop} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-300 hover:bg-primary-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-soft text-secondary-ink">
                <Store size={16} strokeWidth={1.5} />
              </span>
              <div className="text-left leading-tight">
                <p className="text-sm text-ink">{employee?.name ?? '未登录'}</p>
                <p className="text-xs text-muted">{employee?.userName ?? ''}</p>
              </div>
              <ChevronDown size={14} strokeWidth={1.5} className="text-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>账号</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPwdOpen(true)}>
              <KeyRound size={14} strokeWidth={1.5} /> 修改密码
            </DropdownMenuItem>
            <DropdownMenuItem danger onClick={logout}>
              <LogOut size={14} strokeWidth={1.5} /> 退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />
    </header>
  )
}

function PasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      toast.error('请填写完整')
      return
    }
    if (newPwd !== confirmPwd) {
      toast.error('两次输入的新密码不一致')
      return
    }
    if (newPwd.length < 6) {
      toast.error('新密码至少 6 位')
      return
    }
    setLoading(true)
    try {
      await employeeApi.editPassword(oldPwd, newPwd)
      toast.success('密码已更新，请重新登录')
      onOpenChange(false)
      useAuthStore.getState().clear()
      window.location.href = '/login'
    } catch {
      // 拦截器已提示
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>修改成功后会自动退出，需重新登录。</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-6 pb-4">
          <Field label="原密码">
            <Input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
          </Field>
          <Field label="新密码">
            <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </Field>
          <Field label="确认新密码">
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? '提交中…' : '确认修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
