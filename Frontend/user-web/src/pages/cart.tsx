import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { cartApi } from '@/api/cart'
import { useCartStore } from '@/store/cart'
import { formatMoney } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { ShoppingCart } from '@/types/api'

export function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const setItems = useCartStore((s) => s.setItems)
  const totalAmount = items.reduce((sum, i) => sum + i.amount * i.number, 0)

  // 购物车以服务端为准：直接刷新到本页时 store 是空的，必须重新拉一次
  useEffect(() => {
    cartApi.list().then(setItems).catch(() => {})
  }, [setItems])

  const handleSub = async (item: ShoppingCart) => {
    try {
      await cartApi.sub({
        dishId: item.dishId ?? undefined,
        setmealId: item.setmealId ?? undefined,
        dishFlavor: item.dishFlavor ?? undefined,
      })
      const list = await cartApi.list()
      setItems(list)
    } catch {
    }
  }

  const handleAdd = async (item: ShoppingCart) => {
    try {
      await cartApi.add({
        dishId: item.dishId ?? undefined,
        setmealId: item.setmealId ?? undefined,
        dishFlavor: item.dishFlavor ?? undefined,
      })
      const list = await cartApi.list()
      setItems(list)
    } catch {
    }
  }

  const handleClean = async () => {
    try {
      await cartApi.clean()
      setItems([])
      toast.success('购物车已清空')
    } catch {
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Empty
          title="购物车是空的"
          description="去菜单页挑选喜欢的菜品吧"
          icon={<ShoppingBag size={20} strokeWidth={1.5} />}
          action={
            <Button variant="outline" onClick={() => navigate('/menu')}>
              浏览菜单
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-lg text-ink">购物车</h1>
        <Button variant="ghost" size="sm" onClick={handleClean}>
          <Trash2 size={14} strokeWidth={1.5} /> 清空
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="flex items-center gap-4 p-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 shrink-0 rounded-sm object-cover"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                {item.dishFlavor && (
                  <p className="text-xs text-muted">{item.dishFlavor}</p>
                )}
                <p className="mt-1 text-sm text-primary">{formatMoney(item.amount)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSub(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink transition-colors duration-300 hover:bg-primary-soft hover:text-primary"
                  aria-label="减少数量"
                >
                  <Minus size={14} strokeWidth={1.5} />
                </button>
                <span className="min-w-8 text-center text-sm text-ink">{item.number}</span>
                <button
                  onClick={() => handleAdd(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink transition-colors duration-300 hover:bg-primary-soft hover:text-primary"
                  aria-label="增加数量"
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted">合计</p>
            <p className="text-md font-medium text-primary">{formatMoney(totalAmount)}</p>
          </div>
          <Button size="lg" onClick={() => navigate('/checkout')}>
            去结算
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
