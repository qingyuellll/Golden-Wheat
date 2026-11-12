import { useState, useEffect, useCallback } from 'react'
import { Search, Eye, CheckCircle2, XCircle, Truck } from 'lucide-react'
import { orderApi } from '@/api/order'
import { PageHeader } from '@/components/PageHeader'
import { OrderStatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import { Empty } from '@/components/ui/empty'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableContainer,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { usePagination } from '@/hooks/usePagination'
import { formatDateTime, formatMoney } from '@/lib/utils'
import { ORDER_REMIND_EVENT } from '@/lib/websocket'
import { toast } from '@/components/ui/toast'
import type { OrderVO, OrderStatus } from '@/types/api'

const TAB_ALL = 0
const TAB_ITEMS = [
  { value: TAB_ALL, label: '全部' },
  { value: 2, label: '待接单' },
  { value: 3, label: '已接单' },
  { value: 4, label: '派送中' },
  { value: 5, label: '已完成' },
  { value: 6, label: '已取消' },
]

export function OrderPage() {
  const { page, pageSize, setPage, reset } = usePagination()
  const [statusTab, setStatusTab] = useState<number>(TAB_ALL)
  const [numberFilter, setNumberFilter] = useState('')
  const [phoneFilter, setPhoneFilter] = useState('')
  const [searchNumber, setSearchNumber] = useState('')
  const [searchPhone, setSearchPhone] = useState('')
  const [searchStatus, setSearchStatus] = useState<number | undefined>(undefined)
  const [records, setRecords] = useState<OrderVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<OrderVO | null>(null)

  const [actionOpen, setActionOpen] = useState(false)
  const [actionType, setActionType] = useState<'reject' | 'cancel'>('reject')
  const [actionId, setActionId] = useState<number>(0)
  const [actionReason, setActionReason] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderApi.search({
        page, pageSize,
        number: searchNumber || undefined,
        phone: searchPhone || undefined,
        status: searchStatus as OrderStatus | undefined,
      })
      setRecords(res.records)
      setTotal(res.total)
    } catch {
      // interceptor handles
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchNumber, searchPhone, searchStatus])

  useEffect(() => { fetch() }, [fetch])

  // 收到来单/催单提醒时自动刷新列表
  useEffect(() => {
    const onRemind = () => { fetch() }
    window.addEventListener(ORDER_REMIND_EVENT, onRemind)
    return () => window.removeEventListener(ORDER_REMIND_EVENT, onRemind)
  }, [fetch])

  const handleSearch = () => {
    setSearchNumber(numberFilter)
    setSearchPhone(phoneFilter)
    reset()
  }

  const switchTab = (status: number) => {
    setStatusTab(status)
    setSearchStatus(status === TAB_ALL ? undefined : status)
    reset()
  }

  const openDetail = async (id: number) => {
    try {
      const d = await orderApi.detail(id)
      setDetail(d)
      setDetailOpen(true)
    } catch {
      // interceptor handles
    }
  }

  const doAction = async () => {
    if (!actionReason.trim()) {
      toast.error('请填写原因')
      return
    }
    try {
      if (actionType === 'reject') {
        await orderApi.reject({ id: actionId, rejectionReason: actionReason })
        toast.success('已拒单')
      } else {
        await orderApi.cancel({ id: actionId, cancelReason: actionReason })
        toast.success('已取消')
      }
      fetch()
    } catch {
      // interceptor handles
    } finally {
      setActionOpen(false)
      setActionReason('')
    }
  }

  const confirmOrder = async (id: number) => {
    try {
      await orderApi.confirm({ id })
      toast.success('已接单')
      fetch()
    } catch {
      // interceptor handles
    }
  }

  const deliverOrder = async (id: number) => {
    try {
      await orderApi.delivery(id)
      toast.success('已派送')
      fetch()
    } catch {
      // interceptor handles
    }
  }

  const completeOrder = async (id: number) => {
    try {
      await orderApi.complete(id)
      toast.success('已完成')
      fetch()
    } catch {
      // interceptor handles
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="订单管理" description="订单搜索、接单、派送、完成与取消" />

      <div className="card-border p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Input placeholder="订单号" value={numberFilter} onChange={(e) => setNumberFilter(e.target.value)} className="w-48" />
            <Input placeholder="手机号" value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} className="w-36" />
            <Button variant="outline" onClick={handleSearch}><Search size={16} strokeWidth={1.5} /> 查询</Button>
          </div>
          <div className="flex items-center gap-1">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => switchTab(tab.value)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-300 ${
                  statusTab === tab.value
                    ? 'bg-primary text-surface'
                    : 'text-muted hover:bg-primary-soft hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>下单时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted">加载中…</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={7}><Empty title="暂无订单数据" /></TableCell></TableRow>
            ) : records.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-sm">{o.number}</TableCell>
                <TableCell>{o.consignee || o.userName}</TableCell>
                <TableCell>{o.phone}</TableCell>
                <TableCell>{formatMoney(o.amount)}</TableCell>
                <TableCell>{formatDateTime(o.orderTime)}</TableCell>
                <TableCell><OrderStatusBadge status={o.status as OrderStatus} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openDetail(o.id)} title="查看详情">
                      <Eye size={14} strokeWidth={1.5} />
                    </Button>
                    {o.status === 2 && (
                      <>
                        <Button variant="ghost" size="icon-sm" onClick={() => confirmOrder(o.id)} title="接单">
                          <CheckCircle2 size={14} strokeWidth={1.5} className="text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => { setActionType('reject'); setActionId(o.id); setActionOpen(true) }} title="拒单">
                          <XCircle size={14} strokeWidth={1.5} className="text-danger" />
                        </Button>
                      </>
                    )}
                    {o.status === 3 && (
                      <Button variant="ghost" size="icon-sm" onClick={() => deliverOrder(o.id)} title="派送">
                        <Truck size={14} strokeWidth={1.5} className="text-primary" />
                      </Button>
                    )}
                    {o.status === 4 && (
                      <Button variant="ghost" size="icon-sm" onClick={() => completeOrder(o.id)} title="完成">
                        <CheckCircle2 size={14} strokeWidth={1.5} className="text-primary" />
                      </Button>
                    )}
                    {(o.status === 2 || o.status === 3) && (
                      <Button variant="ghost" size="icon-sm" onClick={() => { setActionType('cancel'); setActionId(o.id); setActionOpen(true) }} title="取消">
                        <XCircle size={14} strokeWidth={1.5} className="text-danger" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>订单号：{detail?.number}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-6 pb-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="状态"><OrderStatusBadge status={detail.status as OrderStatus} /></Info>
                <Info label="下单时间">{formatDateTime(detail.orderTime)}</Info>
                <Info label="收货人">{detail.consignee}</Info>
                <Info label="手机号">{detail.phone}</Info>
                <Info label="地址">{detail.address}</Info>
                <Info label="金额">{formatMoney(detail.amount)}</Info>
                <Info label="支付方式">{detail.payMethod === 1 ? '微信' : detail.payMethod === 2 ? '支付宝' : '—'}</Info>
                <Info label="备注">{detail.remark || '—'}</Info>
              </div>
              {detail.orderDetailList && detail.orderDetailList.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">订单明细</p>
                  <div className="flex flex-col gap-2">
                    {detail.orderDetailList.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 rounded-md border border-line p-2">
                        {d.image && <img src={d.image} alt={d.name} className="h-10 w-10 rounded-sm object-cover" />}
                        <div className="flex-1">
                          <p className="text-sm text-ink">{d.name}</p>
                          {d.dishFlavor && <p className="text-xs text-muted">{d.dishFlavor}</p>}
                        </div>
                        <span className="text-sm text-muted">x{d.number}</span>
                        <span className="text-sm text-ink">{formatMoney(d.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{actionType === 'reject' ? '拒单' : '取消订单'}</DialogTitle>
            <DialogDescription>{actionType === 'reject' ? '请填写拒单原因' : '请填写取消原因'}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-6 pb-4">
            <div className="flex flex-col gap-2">
              <Label>原因</Label>
              <Textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionOpen(false)}>取消</Button>
            <Button variant="danger" onClick={doAction}>{actionType === 'reject' ? '确认拒单' : '确认取消'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 text-sm text-ink">{children}</div>
    </div>
  )
}
