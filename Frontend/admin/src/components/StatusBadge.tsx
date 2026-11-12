import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/api'

/** 通用启停状态徽章：1 启用 / 0 禁用 */
export function StatusBadge({ status }: { status: 0 | 1 }) {
  return status === 1 ? (
    <Badge variant="success">启用</Badge>
  ) : (
    <Badge variant="muted">禁用</Badge>
  )
}

const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  1: { label: '待付款', variant: 'muted' },
  2: { label: '待接单', variant: 'secondary' },
  3: { label: '已接单', variant: 'primary' },
  4: { label: '派送中', variant: 'accent' },
  5: { label: '已完成', variant: 'success' },
  6: { label: '已取消', variant: 'danger' },
}

/** 订单状态徽章 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export const ORDER_STATUS_OPTIONS = [
  { value: 1, label: '待付款' },
  { value: 2, label: '待接单' },
  { value: 3, label: '已接单' },
  { value: 4, label: '派送中' },
  { value: 5, label: '已完成' },
  { value: 6, label: '已取消' },
] as const
