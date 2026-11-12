import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { setmealApi } from '@/api/setmeal'
import { cartApi } from '@/api/cart'
import { useCartStore } from '@/store/cart'
import { formatMoney } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { Setmeal, DishItemVO } from '@/types/api'

export function SetmealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setCartItems = useCartStore((s) => s.setItems)
  const [setmeal, setSetmeal] = useState<Setmeal | null>(null)
  const [dishes, setDishes] = useState<DishItemVO[]>([])

  useEffect(() => {
    if (!id) return
    const numId = Number(id)
    setmealApi.getById(numId).then(setSetmeal).catch(() => {})
    setmealApi.getDishes(numId).then(setDishes).catch(() => {})
  }, [id])

  const handleAddToCart = async () => {
    if (!setmeal) return
    try {
      await cartApi.add({ setmealId: setmeal.id })
      const items = await cartApi.list()
      setCartItems(items)
      toast.success('已加入购物车')
    } catch {
    }
  }

  if (!setmeal) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Empty title="套餐不存在" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-muted transition-colors duration-300 hover:text-primary"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> 返回
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-md bg-secondary-soft">
          <img
            src={setmeal.image}
            alt={setmeal.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg text-ink">{setmeal.name}</h1>
              <Badge variant="secondary">套餐</Badge>
            </div>
            {setmeal.description && (
              <p className="mt-2 text-base text-muted">{setmeal.description}</p>
            )}
          </div>

          <p className="text-md font-medium text-primary">{formatMoney(setmeal.price)}</p>

          {dishes.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-ink">包含菜品</p>
              {dishes.map((d, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-md border border-line bg-surface p-3">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="h-12 w-12 rounded-sm object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-ink">{d.name}</p>
                    {d.description && (
                      <p className="truncate text-xs text-muted">{d.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted">x{d.copies}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/cart')}>
              查看购物车
            </Button>
            <Button className="flex-1" onClick={handleAddToCart}>
              加入购物车
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
