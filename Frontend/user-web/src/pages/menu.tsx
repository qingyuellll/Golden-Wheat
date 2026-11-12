import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { categoryApi } from '@/api/category'
import { dishApi } from '@/api/dish'
import { setmealApi } from '@/api/setmeal'
import { formatMoney, cn } from '@/lib/utils'
import type { Category, DishVO, Setmeal } from '@/types/api'

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [dishes, setDishes] = useState<DishVO[]>([])
  const [setmeals, setSetmeals] = useState<Setmeal[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    categoryApi.list().then((list) => {
      setCategories(list)
      if (list.length > 0) setActiveId(list[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!activeId) return
    setLoading(true)
    const cat = categories.find((c) => c.id === activeId)
    const promises =
      cat?.type === 1
        ? [dishApi.listByCategory(activeId).then(setDishes).catch(() => setDishes([])), Promise.resolve(setSetmeals([]))]
        : [setmealApi.listByCategory(activeId).then(setSetmeals).catch(() => setSetmeals([])), Promise.resolve(setDishes([]))]
    Promise.all(promises).finally(() => setLoading(false))
  }, [activeId, categories])

  const dishCategories = categories.filter((c) => c.type === 1)
  const setmealCategories = categories.filter((c) => c.type === 2)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-xl text-ink">菜单</h1>
      <p className="mt-2 text-sm text-muted">精选当季食材，匠心呈现</p>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-48">
          <nav className="flex flex-row gap-2 md:flex-col" aria-label="分类筛选">
            {dishCategories.length > 0 && (
              <div className="flex flex-row gap-2 md:flex-col md:mb-4">
                <p className="hidden md:block text-xs font-medium text-muted mb-2">菜品</p>
                {dishCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors duration-300',
                      activeId === c.id
                        ? 'bg-primary-soft text-primary font-medium'
                        : 'text-ink hover:bg-primary-soft hover:text-primary',
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {setmealCategories.length > 0 && (
              <div className="flex flex-row gap-2 md:flex-col">
                <p className="hidden md:block text-xs font-medium text-muted mb-2">套餐</p>
                {setmealCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors duration-300',
                      activeId === c.id
                        ? 'bg-primary-soft text-primary font-medium'
                        : 'text-ink hover:bg-primary-soft hover:text-primary',
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-md bg-surface animate-pulse" />
              ))}
            </div>
          ) : dishes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dishes.map((dish, idx) => (
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
                      {dish.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted">{dish.description}</p>
                      )}
                      <p className="mt-2 text-sm font-medium text-primary">
                        {formatMoney(dish.price)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : setmeals.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {setmeals.map((sm, idx) => (
                <Link
                  key={sm.id}
                  to={`/setmeal/${sm.id}`}
                  className={cn(
                    'group block transition-all duration-500 ease-plant hover:-translate-y-1',
                    idx % 2 === 1 && 'md:translate-y-3',
                  )}
                >
                  <Card className="overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary-soft">
                      <img
                        src={sm.image}
                        alt={sm.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-plant group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-serif text-base text-ink">{sm.name}</h3>
                        <Badge variant="secondary">套餐</Badge>
                      </div>
                      {sm.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted">{sm.description}</p>
                      )}
                      <p className="mt-2 text-sm font-medium text-primary">
                        {formatMoney(sm.price)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Empty title="暂无菜品" description="该分类下暂无菜品" />
          )}
        </div>
      </div>
    </div>
  )
}
