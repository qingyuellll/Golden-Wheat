import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FileText, RotateCcw, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Pagination } from '@/components/ui/pagination'
import { orderApi } from '@/api/order'
import { formatMoney, formatDateTime, cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { OrderVO, OrderStatus } from '@/types/api'

const STATUS_TABS: { value: OrderStatus | 0; label: string }[] = [
  { value: 0, label: '全部' },
  { value: 1, label: '待付款' },
  { value: 2, label: '待接单' },
  { value: 3, label: '已接单' },
  { value: 4, label: '派送中' },
  { value: 5, label: '已完成' },
  { value: 6, label: '已取消' },
]

const STATUS_MAP: Record<number, { label: string; variant: 'primary' | 'secondary' | 'accent' | 'muted' | 'danger' | 'warn' }> = {
  1: { label: '待付款', variant: 'warn' },
  2: { label: '待接单', variant: 'accent' },
  3: { label: '已接单', variant: 'primary' },
  4: { label: '派送中', variant: 'secondary' },
  5: { label: '已完成', variant: 'muted' },
  6: { label: '已取消', variant: 'danger' },
  7: { label: '退款', variant: 'danger' },
}

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = Number(searchParams.get('status') || 0) as OrderStatus | 0
  const page = Number(searchParams.get('page') || 1)

  const [orders, setOrders] = useState<OrderVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    orderApi
      .history({
        page,
        pageSize: 10,
        status: status || undefined,
      })
      .then((res) => {
        setOrders(res.records)
        setTotal(res.total)
      })
      .catch(() => {
        setOrders([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [status, page])

  const handleCancel = async (id: number) => {
    try {
      await orderApi.cancel(id)
      toast.success('订单已取消')
      setLoading(true)
      const res = await orderApi.history({ page, pageSize: 10, status: status || undefined })
      setOrders(res.records)
      setTotal(res.total)
      setLoading(false)
    } catch {
    }
  }

  const handleRepetition = async (id: number) => {
    try {
      await orderApi.repetition(id)
      toast.success('已加入购物车')
    } catch {
    }
  }

  const handleReminder = async (id: number) => {
    try {
      await orderApi.reminder(id)
      toast.success('已催单')
    } catch {
    }
  }

  const setFilter = (newStatus: number, newPage: number) => {
    setSearchParams({
      ...(newStatus ? { status: String(newStatus) } : {}),
      ...(newPage > 1 ? { page: String(newPage) } : {}),
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-lg text-ink">我的订单</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value, 1)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors duration-300',
              status === tab.value
                ? 'bg-primary-soft text-primary font-medium'
                : 'text-muted hover:text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-md bg-surface animate-pulse" />
          ))
        ) : orders.length === 0 ? (
          <Empty
            title="暂无订单"
            description="快去下单吧"
            icon={<FileText size={20} strokeWidth={1.5} />}
          />
        ) : (
          orders.map((order) => {
            const st = STATUS_MAP[order.status] || { label: '未知', variant: 'muted' as const }
            return (
              <Link key={order.id} to={`/order/${order.id}`}>
                <Card className="transition-all duration-500 ease-plant hover:-translate-y-1 hover:border-primary/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted">{order.number}</span>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      {order.orderDetailList.slice(0, 3).map((d, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <img
                            src={d.image}
                            alt={d.name}
                            className="h-8 w-8 shrink-0 rounded-sm object-cover"
                            loading="lazy"
                          />
                          <span className="flex-1 truncate text-sm text-ink">{d.name}</span>
                          <span className="text-xs text-muted">x{d.number}</span>
                        </div>
                      ))}
                      {order.orderDetailList.length > 3 && (
                        <p className="text-xs text-muted">
                          …共 {order.orderDetailList.length} 件
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted">{formatDateTime(order.orderTime)}</span>
                        <span className="ml-4 text-sm font-medium text-primary">
                          {formatMoney(order.amount)}
                        </span>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                        {order.status === 1 && (
                          <Button variant="danger-outline" size="sm" onClick={() => handleCancel(order.id)}>
                            取消
                          </Button>
                        )}
                        {order.status === 4 && (
                          <Button variant="ghost" size="sm" onClick={() => handleReminder(order.id)}>
                            <Bell size={14} strokeWidth={1.5} /> 催单
                          </Button>
                        )}
                        {(order.status === 5 || order.status === 6) && (
                          <Button variant="ghost" size="sm" onClick={() => handleRepetition(order.id)}>
                            <RotateCcw size={14} strokeWidth={1.5} /> 再来一单
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>

      {total > 0 && (
        <Pagination
          page={page}
          pageSize={10}
          total={total}
          onPageChange={(p) => setFilter(status, p)}
          className="mt-6"
        />
      )}
    </div>
  )
}
