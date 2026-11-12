import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, RotateCcw, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { orderApi } from '@/api/order'
import { formatMoney, formatDateTime } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { OrderVO } from '@/types/api'

const STATUS_MAP: Record<number, { label: string; variant: 'primary' | 'secondary' | 'accent' | 'muted' | 'danger' | 'warn' }> = {
  1: { label: '待付款', variant: 'warn' },
  2: { label: '待接单', variant: 'accent' },
  3: { label: '已接单', variant: 'primary' },
  4: { label: '派送中', variant: 'secondary' },
  5: { label: '已完成', variant: 'muted' },
  6: { label: '已取消', variant: 'danger' },
  7: { label: '退款', variant: 'danger' },
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderVO | null>(null)

  useEffect(() => {
    if (!id) return
    orderApi.detail(Number(id)).then(setOrder).catch(() => {})
  }, [id])

  const handleCancel = async () => {
    if (!order) return
    try {
      await orderApi.cancel(order.id)
      toast.success('订单已取消')
      const updated = await orderApi.detail(order.id)
      setOrder(updated)
    } catch {
    }
  }

  const handleRepetition = async () => {
    if (!order) return
    try {
      await orderApi.repetition(order.id)
      toast.success('已加入购物车')
      navigate('/cart')
    } catch {
    }
  }

  const handleReminder = async () => {
    if (!order) return
    try {
      await orderApi.reminder(order.id)
      toast.success('已催单')
    } catch {
    }
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Empty title="订单不存在" />
      </div>
    )
  }

  const st = STATUS_MAP[order.status] || { label: '未知', variant: 'muted' as const }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-muted transition-colors duration-300 hover:text-primary"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> 返回
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-lg text-ink">订单详情</h1>
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">订单号</span>
                <span className="text-ink">{order.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">下单时间</span>
                <span className="text-ink">{formatDateTime(order.orderTime)}</span>
              </div>
              {order.checkoutTime && (
                <div className="flex justify-between">
                  <span className="text-muted">支付时间</span>
                  <span className="text-ink">{formatDateTime(order.checkoutTime)}</span>
                </div>
              )}
              {order.estimatedDeliveryTime && (
                <div className="flex justify-between">
                  <span className="text-muted">预计送达</span>
                  <span className="text-ink">{formatDateTime(order.estimatedDeliveryTime)}</span>
                </div>
              )}
              {order.remark && (
                <div className="flex justify-between">
                  <span className="text-muted">备注</span>
                  <span className="text-ink">{order.remark}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin size={16} strokeWidth={1.5} className="text-primary" /> 收货信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink">{order.consignee} · {order.phone}</p>
            <p className="text-xs text-muted">{order.address}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">菜品明细</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {order.orderDetailList.map((d, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={d.image}
                  alt={d.name}
                  className="h-10 w-10 shrink-0 rounded-sm object-cover"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-ink">{d.name}</p>
                  {d.dishFlavor && <p className="text-xs text-muted">{d.dishFlavor}</p>}
                </div>
                <span className="text-xs text-muted">x{d.number}</span>
                <span className="text-sm text-ink">{formatMoney(d.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm text-muted">实付金额</span>
            <span className="text-md font-medium text-primary">{formatMoney(order.amount)}</span>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {order.status === 1 && (
            <Button variant="danger-outline" className="flex-1" onClick={handleCancel}>
              取消订单
            </Button>
          )}
          {order.status === 4 && (
            <Button variant="outline" className="flex-1" onClick={handleReminder}>
              <Bell size={16} strokeWidth={1.5} /> 催单
            </Button>
          )}
          {(order.status === 5 || order.status === 6) && (
            <Button className="flex-1" onClick={handleRepetition}>
              <RotateCcw size={16} strokeWidth={1.5} /> 再来一单
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
