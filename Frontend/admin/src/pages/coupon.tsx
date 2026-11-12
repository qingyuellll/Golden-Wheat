import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react'
import { couponApi } from '@/api/coupon'
import { PageHeader } from '@/components/PageHeader'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import { Empty } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableContainer,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { usePagination } from '@/hooks/usePagination'
import { toast } from '@/components/ui/toast'
import { toDateTimeString, toDateTimeInputValue } from '@/lib/utils'
import type { CouponVO, CouponDTO } from '@/types/api'

const emptyForm: CouponDTO = {
  name: '',
  type: 1,
  // 与后端策略工厂对齐：1=每满减 2=折扣 3=固定金额（满减/无门槛立减）
  discountType: 3,
  // 表单不提供商品范围选择，默认全场通用（specific=0），避免建出"定向但无范围"的死券
  specific: 0,
  discountValue: 0,
  thresholdAmount: 0,
  // coupon 表 max_discount_amount 列 NOT NULL，无上限时必须传 0
  maxDiscountAmount: 0,
  obtainWay: 1,
  totalNum: 100,
  // coupon 表 user_limit 列 NOT NULL：每人限领张数
  userLimit: 1,
  issueBeginTime: '',
  issueEndTime: '',
  termDays: 7,
}

export function CouponPage() {
  const { page, pageSize, setPage, reset } = usePagination()
  const [nameFilter, setNameFilter] = useState('')
  const [searchName, setSearchName] = useState('')
  const [records, setRecords] = useState<CouponVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CouponDTO>(emptyForm)
  const [isEdit, setIsEdit] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(0)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await couponApi.page({ page, pageSize, name: searchName || undefined })
      setRecords(res.records)
      setTotal(res.total)
    } catch {
      // interceptor handles
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchName])

  useEffect(() => { fetch() }, [fetch])

  const handleSearch = () => { setSearchName(nameFilter); reset() }

  const openAdd = () => { setEditing({ ...emptyForm }); setIsEdit(false); setFormOpen(true) }

  const openEdit = async (item: CouponVO) => {
    try {
      const detail = await couponApi.detail(item.id)
      setEditing({
        id: detail.id,
        name: detail.name,
        type: detail.discountType === 2 ? 2 : 1,
        discountType: detail.discountType,
        specific: detail.specific ?? 0,
        discountValue: detail.discountValue,
        thresholdAmount: detail.thresholdAmount,
        maxDiscountAmount: detail.maxDiscountAmount ?? 0,
        obtainWay: 1,
        totalNum: detail.totalNum,
        // 后端返回 yyyy-MM-dd HH:mm:ss，datetime-local 只认 yyyy-MM-ddTHH:mm
        issueBeginTime: toDateTimeInputValue(detail.issueBeginTime),
        issueEndTime: toDateTimeInputValue(detail.issueEndTime),
        termDays: 7,
      })
      setIsEdit(true)
      setFormOpen(true)
    } catch {
      // interceptor handles
    }
  }

  const submitForm = async () => {
    if (!editing.name || !editing.discountValue || !editing.issueBeginTime || !editing.issueEndTime) {
      toast.error('请填写完整优惠券信息')
      return
    }
    // 折扣值语义：discountValue=88 表示 8.8 折（后端除以 10 显示）
    if (editing.discountType === 2 && (editing.discountValue < 1 || editing.discountValue > 99)) {
      toast.error('折扣请填写 1-99 的整数，如 88 表示 8.8 折')
      return
    }
    setSubmitting(true)
    try {
      // 券种由优惠类型推导：折扣券 type=2，其余 type=1（代金券）
      // 表单控件给的是 2026-11-11T16:30，统一转成后端约定的 yyyy-MM-dd HH:mm:ss
      const payload: CouponDTO = {
        ...editing,
        type: editing.discountType === 2 ? 2 : 1,
        // coupon 表 max_discount_amount 列 NOT NULL：无上限时传 0
        maxDiscountAmount: editing.maxDiscountAmount ?? 0,
        // coupon 表 user_limit 列 NOT NULL：默认每人限领 1 张
        userLimit: editing.userLimit ?? 1,
        issueBeginTime: toDateTimeString(editing.issueBeginTime),
        issueEndTime: toDateTimeString(editing.issueEndTime),
      }
      if (isEdit) {
        await couponApi.update(payload)
        toast.success('优惠券已更新')
      } else {
        await couponApi.create(payload)
        toast.success('优惠券已添加')
      }
      setFormOpen(false)
      fetch()
    } catch {
      // interceptor handles
    } finally {
      setSubmitting(false)
    }
  }

  const doDelete = async () => {
    try {
      await couponApi.remove(confirmId)
      toast.success('优惠券已删除')
      fetch()
    } catch {
      // interceptor handles
    } finally {
      setConfirmOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="优惠券管理"
        description="优惠券的增删改查与发布管理"
        actions={<Button onClick={openAdd}><Plus size={16} strokeWidth={1.5} /> 新增优惠券</Button>}
      />

      <div className="card-border p-4">
        <div className="flex items-center gap-3">
          <Input placeholder="搜索优惠券名称" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-60" />
          <Button variant="outline" onClick={handleSearch}><Search size={16} strokeWidth={1.5} /> 查询</Button>
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>规则</TableHead>
              <TableHead>发放时间</TableHead>
              <TableHead>库存</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted">加载中…</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={7}><Empty title="暂无优惠券数据" /></TableCell></TableRow>
            ) : records.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.typeDesc}</TableCell>
                <TableCell>{item.ruleDesc}</TableCell>
                <TableCell>{item.issueBeginTime} ~ {item.issueEndTime}</TableCell>
                <TableCell>{item.remainNum}/{item.totalNum}</TableCell>
                <TableCell><Badge variant={item.status === 1 ? 'success' : 'muted'}>{item.statusDesc}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}><Pencil size={14} strokeWidth={1.5} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => { setConfirmId(item.id); setConfirmOpen(true) }}><Trash2 size={14} strokeWidth={1.5} className="text-danger" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑优惠券' : '新增优惠券'}</DialogTitle>
            <DialogDescription>设置优惠券规则与有效期</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-6 pb-4">
            <div className="flex flex-col gap-2">
              <Label>名称</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>优惠类型</Label>
                <Select
                  value={editing.discountType.toString()}
                  onValueChange={(v) => {
                    const t = Number(v)
                    // 无门槛立减 = 固定金额策略 + 门槛 0；切换类型时归零折扣/上限避免残留
                    setEditing({
                      ...editing,
                      discountType: t,
                      thresholdAmount: t === 3 && editing.thresholdAmount === undefined ? 0 : editing.thresholdAmount,
                      discountValue: t === 2 ? 88 : editing.discountValue,
                    })
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {/* 选项语义与后端 DiscountStrategyFactory 严格对齐：1=每满减 2=折扣 3=固定金额 */}
                    <SelectItem value="3">满减 / 无门槛立减</SelectItem>
                    <SelectItem value="1">每满减</SelectItem>
                    <SelectItem value="2">折扣</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  {editing.discountType === 2
                    ? '折扣（填 88 表示 8.8 折）'
                    : editing.discountType === 1
                      ? '每档减免金额 (元)'
                      : '减免金额 (元)'}
                </Label>
                <Input
                  type="number"
                  step={editing.discountType === 2 ? 1 : 0.01}
                  value={editing.discountValue || ''}
                  onChange={(e) => setEditing({ ...editing, discountValue: Number(e.target.value) })}
                />
              </div>
              {(editing.discountType === 1 || editing.discountType === 3) && (
                <div className="flex flex-col gap-2">
                  <Label>{editing.discountType === 1 ? '每满金额 (元)' : '门槛金额 (元，0 表示无门槛)'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.thresholdAmount ?? 0}
                    onChange={(e) => setEditing({ ...editing, thresholdAmount: Number(e.target.value) || 0 })}
                  />
                </div>
              )}
              {(editing.discountType === 1 || editing.discountType === 2) && (
                <div className="flex flex-col gap-2">
                  <Label>优惠上限 (元，0 表示不封顶)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.maxDiscountAmount ?? 0}
                    onChange={(e) => setEditing({ ...editing, maxDiscountAmount: Number(e.target.value) || 0 })}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label>发放总量</Label>
                <Input type="number" min={0} value={editing.totalNum || ''} onChange={(e) => setEditing({ ...editing, totalNum: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>每人限领 (张)</Label>
                <Input type="number" min={1} value={editing.userLimit ?? 1} onChange={(e) => setEditing({ ...editing, userLimit: Number(e.target.value) || 1 })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>发放开始</Label>
                <Input type="datetime-local" value={editing.issueBeginTime} onChange={(e) => setEditing({ ...editing, issueBeginTime: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>发放结束</Label>
                <Input type="datetime-local" value={editing.issueEndTime} onChange={(e) => setEditing({ ...editing, issueEndTime: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>有效天数</Label>
                <Input type="number" min={1} value={editing.termDays || ''} onChange={(e) => setEditing({ ...editing, termDays: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>取消</Button>
            <Button onClick={submitForm} disabled={submitting}>
              {submitting && <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />}
              {isEdit ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="删除优惠券"
        description="删除后不可恢复，确认删除？"
        confirmLabel="删除"
        danger
        onConfirm={doDelete}
      />
    </div>
  )
}
