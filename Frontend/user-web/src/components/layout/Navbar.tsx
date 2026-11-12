import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Leaf, LogOut } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: '首页' },
  { to: '/menu', label: '菜单' },
  { to: '/orders', label: '订单' },
  { to: '/coupons', label: '优惠券' },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.number, 0))
  const isAuth = useAuthStore((s) => s.isAuthenticated())

  const handleLogout = () => {
    useAuthStore.getState().logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="金麦首页">
          <Leaf size={24} strokeWidth={1.5} className="text-primary" />
          <span className="font-serif text-lg text-ink">金麦</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'nav-link text-sm text-ink',
                  isActive && 'active',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink transition-all duration-300 hover:bg-primary-soft hover:text-primary"
            aria-label={`购物车 ${cartCount} 件`}
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-xs text-surface">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <Link
            to={isAuth ? '/address' : '/login'}
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink transition-all duration-300 hover:bg-primary-soft hover:text-primary"
            aria-label="个人中心"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>
          {isAuth && (
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink transition-all duration-300 hover:bg-primary-soft hover:text-primary"
              aria-label="退出登录"
              title="退出登录"
            >
              <LogOut size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex items-center justify-around border-t border-line bg-surface px-4 py-2 md:hidden" aria-label="移动端导航">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'text-xs text-muted transition-all duration-300',
                isActive && 'text-primary font-medium',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
