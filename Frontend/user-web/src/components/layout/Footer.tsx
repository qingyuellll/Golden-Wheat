import { Leaf, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

const FOOTER_LINKS = [
  {
    title: '服务',
    items: [
      { label: '菜单', to: '/menu' },
      { label: '优惠券', to: '/coupons' },
      { label: 'AI 客服', to: '/chat' },
    ],
  },
  {
    title: '账户',
    items: [
      { label: '我的订单', to: '/orders' },
      { label: '收货地址', to: '/address' },
      { label: '我的优惠券', to: '/coupons' },
    ],
  },
  {
    title: '关于',
    items: [
      { label: '关于金麦', to: '/' },
      { label: '联系客服', to: '/chat' },
    ],
  },
]

export function Footer() {
  const isAuth = useAuthStore((s) => s.isAuthenticated())
  const navigate = useNavigate()

  const handleLogout = () => {
    useAuthStore.getState().logout()
    navigate('/login')
  }

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Leaf size={20} strokeWidth={1.5} className="text-primary" />
              <span className="font-serif text-md text-ink">金麦</span>
            </div>
            <p className="text-sm text-muted">
              自然之味，用心烹饪
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h4 className="text-sm font-medium text-ink">{group.title}</h4>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-muted transition-all duration-300 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {group.title === '账户' && isAuth && (
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 text-sm text-muted transition-all duration-300 hover:text-primary"
                    >
                      <LogOut size={14} strokeWidth={1.5} />
                      退出登录
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-6 text-center">
          <p className="text-sm text-muted">
            Golden Wheat &copy; {new Date().getFullYear()} · 保留所有权利
          </p>
        </div>
      </div>
    </footer>
  )
}
