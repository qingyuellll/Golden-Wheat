import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Leaf, Clock, Tag, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { useIntersection } from '@/hooks/useIntersection'
import { categoryApi } from '@/api/category'
import { dishApi } from '@/api/dish'
import { couponApi } from '@/api/coupon'
import { shopApi } from '@/api/shop'
import { cartApi } from '@/api/cart'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { formatMoney } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Category, DishVO, CouponVO } from '@/types/api'

const TESTIMONIALS = [
  { name: '林小姐', text: '食材新鲜，口味地道，每次点餐都不会失望。' },
  { name: '张先生', text: '配送很快，包装精致，很有品质感。' },
  { name: '王女士', text: '优惠券很实在，套餐性价比很高，会一直回购。' },
]

export function HomePage() {
  const navigate = useNavigate()
  const setCartItems = useCartStore((s) => s.setItems)
  const [shopOpen, setShopOpen] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [hotDishes, setHotDishes] = useState<DishVO[]>([])
  const [coupons, setCoupons] = useState<CouponVO[]>([])

  const [heroRef, heroVisible] = useIntersection<HTMLElement>()
  const [dishRef, dishVisible] = useIntersection<HTMLElement>()
  const [couponRef, couponVisible] = useIntersection<HTMLElement>()
  const [reviewRef, reviewVisible] = useIntersection<HTMLElement>()

  const isAuth = useAuthStore((s) => s.isAuthenticated())

  useEffect(() => {
    shopApi.getStatus().then((s) => setShopOpen(s === 1)).catch(() => {})
    categoryApi.list(1).then(setCategories).catch(() => {})
    couponApi.available().then(setCoupons).catch(() => {})
    // 购物车属于登录态资源：游客访问首页时不请求，避免 401 把游客踢到登录页
    if (isAuth) {
      cartApi.list().then(setCartItems).catch(() => {})
    }
  }, [isAuth, setCartItems])

  useEffect(() => {
    if (categories.length > 0) {
      dishApi.listByCategory(categories[0].id).then(setHotDishes).catch(() => {})
    }
  }, [categories])

  return (
    <div className="flex flex-col">
      {!shopOpen && (
        <div className="bg-danger-soft py-3 text-center text-sm text-danger">
          店铺已打烊，暂不接单
        </div>
      )}

      <section
        ref={heroRef}
        className={cn(
          'mx-auto w-full max-w-7xl px-4 py-16 md:py-24 transition-all duration-500 ease-plant',
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        )}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
            <Leaf size={14} strokeWidth={1.5} /> 自然之味
          </Badge>
          <h1 className="font-serif text-lg text-ink md:text-xl">
            用心烹饪，<br />
            <span className="italic text-primary">源自自然</span>
          </h1>
          <p className="max-w-xl text-base text-muted md:text-md">
            每一道菜品都精选当季食材，以匠心手艺呈现自然本味
          </p>
          <div className="flex gap-4">
            <Button size="lg" onClick={() => navigate('/menu')}>
              浏览菜单 <ArrowRight size={16} strokeWidth={1.5} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/coupons')}>
              领取优惠
            </Button>
          </div>
        </div>
      </section>

      {coupons.length > 0 && (
        <section
          ref={couponRef}
          className={cn(
            'mx-auto w-full max-w-7xl px-4 pb-12 transition-all duration-500 ease-plant',
            couponVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg text-ink">限时优惠</h2>
            <Link to="/coupons" className="link-soft text-sm text-muted">
              查看全部 <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.slice(0, 3).map((c) => (
              <Card key={c.id} className="group overflow-hidden transition-all duration-500 ease-plant hover:-translate-y-1 hover:border-primary/40">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary-soft">
                    <Tag size={20} strokeWidth={1.5} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-muted">{c.ruleDesc}</p>
                  </div>
                  <Badge variant="accent">{c.typeDesc}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section
        ref={dishRef}
        className={cn(
          'mx-auto w-full max-w-7xl px-4 pb-16 transition-all duration-500 ease-plant',
          dishVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg text-ink">热门菜品</h2>
          <Link to="/menu" className="link-soft text-sm text-muted">
            查看全部 <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
        {hotDishes.length === 0 ? (
          <Empty title="暂无菜品" description="敬请期待" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hotDishes.slice(0, 8).map((dish, idx) => (
              <Link
                key={dish.id}
                to={`/dish/${dish.id}`}
                className={cn(
                  'group block transition-all duration-500 ease-plant hover:-translate-y-1',
                  idx % 2 === 1 && 'md:translate-y-3',
                )}
              >
                <Card className="overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary-soft">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-plant group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="truncate font-serif text-base text-ink">{dish.name}</h3>
                    <p className="mt-1 text-sm text-primary font-medium">
                      {formatMoney(dish.price)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        ref={reviewRef}
        className={cn(
          'mx-auto w-full max-w-7xl px-4 pb-16 transition-all duration-500 ease-plant',
          reviewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        )}
      >
        <h2 className="font-serif text-lg text-ink mb-6">用户评价</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="p-6">
              <Quote size={20} strokeWidth={1.5} className="text-primary mb-3" />
              <p className="text-sm text-ink leading-relaxed">{t.text}</p>
              <p className="mt-4 text-xs text-muted">— {t.name}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft">
              <Clock size={24} strokeWidth={1.5} className="text-primary-ink" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-md text-ink">营业时间</h3>
              <p className="text-sm text-muted">每日 10:00 - 22:00 · 全年无休</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/chat')}>
              联系客服
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
