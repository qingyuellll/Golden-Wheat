import { useEffect, useState } from 'react'
import {
  Banknote,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  UtensilsCrossed,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { workspaceApi } from '@/api/workspace'
import { orderApi } from '@/api/order'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { BusinessData, OrderOverView, DishOverView, SetmealOverView, OrderStatistics } from '@/types/api'
import { formatMoney, formatNumber } from '@/lib/utils'

export function DashboardPage() {
  const [biz, setBiz] = useState<BusinessData | null>(null)
  const [orders, setOrders] = useState<OrderOverView | null>(null)
  const [dishes, setDishes] = useState<DishOverView | null>(null)
  const [setmeals, setSetmeals] = useState<SetmealOverView | null>(null)
  const [stats, setStats] = useState<OrderStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      workspaceApi.businessData().catch(() => null),
      workspaceApi.overviewOrders().catch(() => null),
      workspaceApi.overviewDishes().catch(() => null),
      workspaceApi.overviewSetmeals().catch(() => null),
      orderApi.statistics().catch(() => null),
    ]).then(([b, o, d, s, st]) => {
      setBiz(b)
      setOrders(o)
      setDishes(d)
      setSetmeals(s)
      setStats(st)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="工作台" description="今日经营核心数据与各状态订单概览" />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card-border p-6">
              <Skeleton className="mb-3 h-4 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <DataCard
              icon={<Banknote size={18} strokeWidth={1.5} />}
              label="今日营业额"
              value={formatMoney(biz?.turnover ?? 0)}
              accent
            />
            <DataCard
              icon={<ShoppingCart size={18} strokeWidth={1.5} />}
              label="有效订单"
              value={formatNumber(biz?.validOrderCount ?? 0)}
            />
            <DataCard
              icon={<TrendingUp size={18} strokeWidth={1.5} />}
              label="订单完成率"
              value={`${((biz?.orderCompletionRate ?? 0) * 100).toFixed(1)}%`}
            />
            <DataCard
              icon={<Banknote size={18} strokeWidth={1.5} />}
              label="平均客单价"
              value={formatMoney(biz?.unitPrice ?? 0)}
            />
            <DataCard
              icon={<UserPlus size={18} strokeWidth={1.5} />}
              label="新增用户"
              value={formatNumber(biz?.newUsers ?? 0)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>订单概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <OrderStatRow icon={<Clock size={16} strokeWidth={1.5} />} label="待接单" count={stats?.toBeConfirmed ?? 0} variant="secondary" />
                  <OrderStatRow icon={<ShoppingCart size={16} strokeWidth={1.5} />} label="待派送" count={stats?.confirmed ?? 0} variant="accent" />
                  <OrderStatRow icon={<Loader2 size={16} strokeWidth={1.5} />} label="派送中" count={stats?.deliveryInProgress ?? 0} variant="primary" />
                  {orders && (
                    <>
                      <div className="my-1 border-t border-line" />
                      <OrderStatRow icon={<CheckCircle2 size={16} strokeWidth={1.5} />} label="已完成" count={orders.completedOrders} variant="success" />
                      <OrderStatRow icon={<XCircle size={16} strokeWidth={1.5} />} label="已取消" count={orders.cancelledOrders} variant="danger" />
                      <div className="text-sm text-muted">全部订单：{formatNumber(orders.allOrders)}</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>菜品总览</CardTitle>
              </CardHeader>
              <CardContent>
                {dishes ? (
                  <div className="flex flex-col gap-3">
                    <OverviewRow icon={<UtensilsCrossed size={16} strokeWidth={1.5} />} label="已启售" count={dishes.sold} />
                    <OverviewRow icon={<UtensilsCrossed size={16} strokeWidth={1.5} />} label="已停售" count={dishes.discontinued} muted />
                  </div>
                ) : (
                  <p className="text-sm text-muted">暂无数据</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>套餐总览</CardTitle>
              </CardHeader>
              <CardContent>
                {setmeals ? (
                  <div className="flex flex-col gap-3">
                    <OverviewRow icon={<Package size={16} strokeWidth={1.5} />} label="已启售" count={setmeals.sold} />
                    <OverviewRow icon={<Package size={16} strokeWidth={1.5} />} label="已停售" count={setmeals.discontinued} muted />
                  </div>
                ) : (
                  <p className="text-sm text-muted">暂无数据</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function DataCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="card-border p-6">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className={`mt-2 font-serif text-xl ${accent ? 'text-primary' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  )
}

function OrderStatRow({
  icon,
  label,
  count,
  variant,
}: {
  icon: React.ReactNode
  label: string
  count: number
  variant: React.ComponentProps<typeof Badge>['variant']
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-ink">
        {icon}
        {label}
      </div>
      <Badge variant={variant}>{count}</Badge>
    </div>
  )
}

function OverviewRow({
  icon,
  label,
  count,
  muted: isMuted,
}: {
  icon: React.ReactNode
  label: string
  count: number
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-ink">
        {icon}
        {label}
      </div>
      <span className={`text-sm ${isMuted ? 'text-muted' : 'text-primary'}`}>
        {count}
      </span>
    </div>
  )
}
