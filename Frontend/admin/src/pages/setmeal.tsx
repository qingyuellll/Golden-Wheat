import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { setmealApi } from '@/api/setmeal'
import { categoryApi } from '@/api/category'
import { dishApi } from '@/api/dish'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Pagination } from '@/components/ui/pagination'
import { Empty } from '@/components/ui/empty'
import { Textarea } from '@/components/ui/textarea'
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
import { formatDateTime, formatMoney } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { SetmealVO, SetmealDTO, Category, Dish } from '@/types/api'

const emptyForm: SetmealDTO = { categoryId: 0, name: '', price: 0, image: '', description: '', setmealDishes: [] }

export function SetmealPage() {
  const { page, pageSize, setPage, reset } = usePagination()
  const [nameFilter, setNameFilter] = useState('')
  const [searchName, setSearchName] = useState('')
  const [records, setRecords] = useState<SetmealVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SetmealDTO>(emptyForm)
  const [isEdit, setIsEdit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([])

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'toggle' | 'delete'>('toggle')
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; status?: 0 | 1; ids?: number[] } | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    categoryApi.listByType(2).then(setCategories).catch(() => {})
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await setmealApi.page({ page, pageSize, name: searchName || undefined })
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

  const openAdd = () => {
    setEditing({ ...emptyForm, categoryId: categories[0]?.id ?? 0 })
    setIsEdit(false)
    setAvailableDishes([])
    setFormOpen(true)
  }

  const openEdit = async (item: SetmealVO) => {
    try {
      const detail = await setmealApi.detail(item.id)
      setEditing({
        id: detail.id,
        categoryId: detail.categoryId,
        name: detail.name,
        price: detail.price,
        image: detail.image,
        description: detail.description,
        status: detail.status,
        setmealDishes: detail.setmealDishes,
      })
      setIsEdit(true)
      setFormOpen(true)
      if (detail.categoryId) {
        const dishes = await dishApi.listByCategory(detail.categoryId)
        setAvailableDishes(dishes)
      }
    } catch {
      // interceptor handles
    }
  }

  const onCategoryChange = async (catId: number) => {
    setEditing({ ...editing, categoryId: catId, setmealDishes: [] })
    try {
      const dishes = await dishApi.listByCategory(catId)
      setAvailableDishes(dishes)
    } catch {
      setAvailableDishes([])
    }
  }

  const addDish = (dish: Dish) => {
    const exists = (editing.setmealDishes ?? []).some((d) => d.dishId === dish.id)
    if (exists) return
    setEditing({
      ...editing,
      setmealDishes: [
        ...(editing.setmealDishes ?? []),
        { dishId: dish.id, name: dish.name, price: dish.price, copies: 1 },
      ],
    })
  }

  const removeDish = (idx: number) => {
    setEditing({
      ...editing,
      setmealDishes: (editing.setmealDishes ?? []).filter((_, i) => i !== idx),
    })
  }

  const updateCopies = (idx: number, copies: number) => {
    const dishes = [...(editing.setmealDishes ?? [])]
    dishes[idx] = { ...dishes[idx], copies: Math.max(1, copies) }
    setEditing({ ...editing, setmealDishes: dishes })
  }

  const submitForm = async () => {
    if (!editing.name || !editing.categoryId || !editing.price || !editing.image) {
      toast.error('请填写完整套餐信息')
      return
    }
    if ((editing.setmealDishes ?? []).length === 0) {
      toast.error('请至少选择一道菜品')
      return
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await setmealApi.update(editing)
        toast.success('套餐已更新')
      } else {
        await setmealApi.create(editing)
        toast.success('套餐已添加')
      }
      setFormOpen(false)
      fetch()
    } catch {
      // interceptor handles
    } finally {
      setSubmitting(false)
    }
  }

  const doConfirm = async () => {
    if (!confirmTarget) return
    try {
      if (confirmAction === 'toggle' && confirmTarget.status !== undefined) {
        await setmealApi.toggleStatus(confirmTarget.id, confirmTarget.status)
        toast.success(confirmTarget.status === 1 ? '已起售' : '已停售')
      } else if (confirmAction === 'delete') {
        const ids = confirmTarget.ids ?? [confirmTarget.id]
        await setmealApi.batchDelete(ids)
        toast.success('套餐已删除')
        setSelectedIds([])
      }
      fetch()
    } catch {
      // interceptor handles
    } finally {
      setConfirmOpen(false)
      setConfirmTarget(null)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }
  const toggleAll = () => {
    setSelectedIds((prev) => prev.length === records.length ? [] : records.map((r) => r.id))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="套餐管理"
        description="套餐的增删改查、起售停售与关联菜品"
        actions={
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button variant="danger-outline" onClick={() => { setConfirmAction('delete'); setConfirmTarget({ id: 0, ids: selectedIds }); setConfirmOpen(true) }}>
                <Trash2 size={16} strokeWidth={1.5} /> 批量删除 ({selectedIds.length})
              </Button>
            )}
            <Button onClick={openAdd}><Plus size={16} strokeWidth={1.5} /> 新增套餐</Button>
          </div>
        }
      />

      <div className="card-border p-4">
        <div className="flex items-center gap-3">
          <Input placeholder="搜索套餐名称" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-60" />
          <Button variant="outline" onClick={handleSearch}><Search size={16} strokeWidth={1.5} /> 查询</Button>
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><input type="checkbox" checked={selectedIds.length === records.length && records.length > 0} onChange={toggleAll} className="rounded-sm border-line" /></TableHead>
              <TableHead>套餐名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>价格</TableHead>
              <TableHead>图片</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted">加载中…</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={8}><Empty title="暂无套餐数据" /></TableCell></TableRow>
            ) : records.map((item) => (
              <TableRow key={item.id}>
                <TableCell><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded-sm border-line" /></TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.categoryName}</TableCell>
                <TableCell>{formatMoney(item.price)}</TableCell>
                <TableCell>{item.image && <img src={item.image} alt={item.name} className="h-10 w-10 rounded-sm object-cover" />}</TableCell>
                <TableCell><StatusBadge status={item.status as 0 | 1} /></TableCell>
                <TableCell>{formatDateTime(item.updateTime)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch checked={item.status === 1} onCheckedChange={(checked) => { setConfirmAction('toggle'); setConfirmTarget({ id: item.id, status: checked ? 1 : 0 }); setConfirmOpen(true) }} />
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}><Pencil size={14} strokeWidth={1.5} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => { setConfirmAction('delete'); setConfirmTarget({ id: item.id }); setConfirmOpen(true) }}><Trash2 size={14} strokeWidth={1.5} className="text-danger" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑套餐' : '新增套餐'}</DialogTitle>
            <DialogDescription>{isEdit ? '修改套餐信息与关联菜品' : '创建套餐并选择关联菜品'}</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-6 pb-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>套餐名称</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>套餐分类</Label>
                <Select value={editing.categoryId.toString()} onValueChange={(v) => onCategoryChange(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>价格 (元)</Label>
                <Input type="number" step="0.01" value={editing.price || ''} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>套餐图片</Label>
                <ImageUpload value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>描述</Label>
              <Textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>关联菜品</Label>
              {availableDishes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableDishes.map((d) => {
                    const selected = (editing.setmealDishes ?? []).some((sd) => sd.dishId === d.id)
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => addDish(d)}
                        className={cn(
                          'rounded-md border px-3 py-1 text-sm transition-colors duration-300',
                          selected ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface text-ink hover:border-primary/40',
                        )}
                      >
                        {d.name} {formatMoney(d.price)}
                      </button>
                    )
                  })}
                </div>
              )}
              {(editing.setmealDishes ?? []).length > 0 && (
                <div className="flex flex-col gap-2">
                  {(editing.setmealDishes ?? []).map((sd, idx) => (
                    <div key={sd.dishId} className="flex items-center gap-2 rounded-md border border-line p-3">
                      <span className="flex-1 text-sm text-ink">{sd.name}</span>
                      <span className="text-sm text-muted">{formatMoney(sd.price)}</span>
                      <Input type="number" min={1} value={sd.copies} onChange={(e) => updateCopies(idx, Number(e.target.value))} className="w-16" />
                      <Button variant="ghost" size="icon-sm" onClick={() => removeDish(idx)}><X size={14} strokeWidth={1.5} className="text-danger" /></Button>
                    </div>
                  ))}
                </div>
              )}
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
        title={confirmAction === 'delete' ? '删除套餐' : confirmTarget?.status === 1 ? '起售套餐' : '停售套餐'}
        description={confirmAction === 'delete' ? '删除后不可恢复，确认删除？' : confirmTarget?.status === 1 ? '确认起售？' : '确认停售？'}
        confirmLabel={confirmAction === 'delete' ? '删除' : confirmTarget?.status === 1 ? '起售' : '停售'}
        danger={confirmAction === 'delete' || confirmTarget?.status === 0}
        onConfirm={doConfirm}
      />
    </div>
  )
}

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ')
}
