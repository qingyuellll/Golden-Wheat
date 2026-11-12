import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { dishApi } from '@/api/dish'
import { cartApi } from '@/api/cart'
import { useCartStore } from '@/store/cart'
import { formatMoney, parseJsonArray, cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { DishVO } from '@/types/api'

export function DishDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setCartItems = useCartStore((s) => s.setItems)
  const [dish, setDish] = useState<DishVO | null>(null)
  const [selectedFlavors, setSelectedFlavors] = useState<Record<string, string>>({})
  useEffect(() => {
    if (!id) return
    dishApi.getById(Number(id)).then(setDish).catch(() => {})
  }, [id])

  const handleAddToCart = async () => {
    if (!dish) return
    try {
      const flavorKeys = Object.keys(selectedFlavors)
      const flavorStr = flavorKeys.length > 0
        ? flavorKeys.map((k) => selectedFlavors[k]).join(',')
        : undefined
      await cartApi.add({ dishId: dish.id, dishFlavor: flavorStr })
      const items = await cartApi.list()
      setCartItems(items)
      toast.success('已加入购物车')
    } catch {
    }
  }

  if (!dish) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Empty title="菜品不存在" />
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
            src={dish.image}
            alt={dish.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-serif text-lg text-ink">{dish.name}</h1>
            {dish.description && (
              <p className="mt-2 text-base text-muted">{dish.description}</p>
            )}
          </div>

          <p className="text-md font-medium text-primary">{formatMoney(dish.price)}</p>

          {dish.flavors && dish.flavors.length > 0 && (
            <div className="flex flex-col gap-4">
              {dish.flavors.map((flavor) => {
                const options = parseJsonArray(flavor.value)
                return (
                  <div key={flavor.id || flavor.name} className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-ink">{flavor.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setSelectedFlavors((prev) => ({
                              ...prev,
                              [flavor.name]: opt,
                            }))
                          }
                          className={cn(
                            'rounded-md border px-3 py-1.5 text-sm transition-all duration-300',
                            selectedFlavors[flavor.name] === opt
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'border-line bg-surface text-ink hover:border-primary/40',
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
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
