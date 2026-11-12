import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { dishApi } from '@/api/dish'
import { categoryApi } from '@/api/category'
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
import { formatDateTime, formatMoney, parseJsonArray } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { DishVO, DishDTO, DishFlavor, Category } from '@/types/api'

const emptyForm: DishDTO = { name: '', categoryId: 0, price: 0, image: '', description: '', status: 1, flavors: [] }

export function DishPage() {
  const { page, pageSize, setPage, reset } = usePagination()
  const [nameFilter, setNameFilter] = useState('')
  const [catFilter, setCatFilter] = useState<number | undefined>(undefined)
  const [searchName, setSearchName] = useState('')
  const [searchCat, setSearchCat] = useState<number | undefined>(undefined)
  const [records, setRecords] = useState<DishVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DishDTO>(emptyForm)
  const [isEdit, setIsEdit] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'toggle' | 'delete'>('toggle')
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; status?: 0 | 1; ids?: number[] } | null>(null)

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    categoryApi.listByType(1).then(setCategories).catch(() => {})
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await dishApi.page({
        page, pageSize,
        name: searchName || undefined,
        categoryId: searchCat,
      })
      setRecords(res.records)
      setTotal(res.total)
    } catch {
      // interceptor handles
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchName, searchCat])

  useEffect(() => { fetch() }, [fetch])

  const handleSearch = () => {
    setSearchName(nameFilter)
    setSearchCat(catFilter)
    reset()
  }

  const openAdd = () => {
    setEditing({ ...emptyForm, categoryId: categories[0]?.id ?? 0 })
    setIsEdit(false)
    setFormOpen(true)
  }

  const openEdit = async (dish: DishVO) => {
    try {
      const detail = await dishApi.detail(dish.id)
      setEditing({
        id: detail.id,
        name: detail.name,
        categoryId: detail.categoryId,
        price: detail.price,
        image: detail.image,
        description: detail.description,
        status: detail.status,
        flavors: detail.flavors,
      })
      setIsEdit(true)
      setFormOpen(true)
    } catch {
      // interceptor handles
    }
  }

  const submitForm = async () => {
    if (!editing.name || !editing.categoryId || !editing.price || !editing.image) {
      toast.error('请填写完整菜品信息（名称、分类、价格、图片）')
      return
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await dishApi.update(editing)
        toast.success('菜品已更新')
      } else {
        await dishApi.create(editing)
        toast.success('菜品已添加')
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
        await dishApi.toggleStatus(confirmTarget.id, confirmTarget.status)
        toast.success(confirmTarget.status === 1 ? '已起售' : '已停售')
      } else if (confirmAction === 'delete') {
        const ids = confirmTarget.ids ?? [confirmTarget.id]
        await dishApi.remove(ids)
        toast.success('菜品已删除')
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

  const addFlavor = () => {
    setEditing({
      ...editing,
      flavors: [...(editing.flavors ?? []), { name: '', value: '[]' }],
    })
  }

  const removeFlavor = (idx: number) => {
    setEditing({
      ...editing,
      flavors: (editing.flavors ?? []).filter((_, i) => i !== idx),
    })
  }

  const updateFlavor = (idx: number, field: keyof DishFlavor, val: string) => {
    const flavors = [...(editing.flavors ?? [])]
    flavors[idx] = { ...flavors[idx], [field]: val }
    setEditing({ ...editing, flavors })
  }

  const updateFlavorValues = (idx: number, tagStr: string) => {
    const arr = tagStr.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
    const flavors = [...(editing.flavors ?? [])]
    flavors[idx] = { ...flavors[idx], value: JSON.stringify(arr) }
    setEditing({ ...editing, flavors })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="菜品管理"
        description="菜品的新增、编辑、起售停售与口味维护"
        actions={
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="danger-outline"
                onClick={() => {
                  setConfirmAction('delete')
                  setConfirmTarget({ id: 0, ids: selectedIds })
                  setConfirmOpen(true)
                }}
              >
                <Trash2 size={16} strokeWidth={1.5} /> 批量删除 ({selectedIds.length})
              </Button>
            )}
            <Button onClick={openAdd}><Plus size={16} strokeWidth={1.5} /> 新增菜品</Button>
          </div>
        }
      />

      <div className="card-border p-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="搜索菜品名称"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-60"
          />
          <Select
            value={catFilter?.toString() ?? ''}
            onValueChange={(v) => setCatFilter(v ? Number(v) : undefined)}
          >
            <SelectTrigger className="w-36"><SelectValue placeholder="全部分类" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部分类</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleSearch}>
            <Search size={16} strokeWidth={1.5} /> 查询
          </Button>
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" checked={selectedIds.length === records.length && records.length > 0} onChange={toggleAll} className="rounded-sm border-line" />
              </TableHead>
              <TableHead>菜品名称</TableHead>
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
              <TableRow><TableCell colSpan={8}><Empty title="暂无菜品数据" /></TableCell></TableRow>
            ) : records.map((dish) => (
              <TableRow key={dish.id}>
                <TableCell>
                  <input type="checkbox" checked={selectedIds.includes(dish.id)} onChange={() => toggleSelect(dish.id)} className="rounded-sm border-line" />
                </TableCell>
                <TableCell>{dish.name}</TableCell>
                <TableCell>{dish.categoryName}</TableCell>
                <TableCell>{formatMoney(dish.price)}</TableCell>
                <TableCell>
                  {dish.image && <img src={dish.image} alt={dish.name} className="h-10 w-10 rounded-sm object-cover" />}
                </TableCell>
                <TableCell><StatusBadge status={dish.status as 0 | 1} /></TableCell>
                <TableCell>{formatDateTime(dish.updateTime)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={dish.status === 1}
                      onCheckedChange={(checked) => {
                        setConfirmAction('toggle')
                        setConfirmTarget({ id: dish.id, status: checked ? 1 : 0 })
                        setConfirmOpen(true)
                      }}
                    />
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(dish)}>
                      <Pencil size={14} strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost" size="icon-sm"
                      onClick={() => {
                        setConfirmAction('delete')
                        setConfirmTarget({ id: dish.id })
                        setConfirmOpen(true)
                      }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} className="text-danger" />
                    </Button>
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
            <DialogTitle>{isEdit ? '编辑菜品' : '新增菜品'}</DialogTitle>
            <DialogDescription>{isEdit ? '修改菜品信息与口味' : '填写菜品信息，可添加多种口味选项'}</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-6 pb-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>菜品名称</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>菜品分类</Label>
                <Select value={editing.categoryId.toString()} onValueChange={(v) => setEditing({ ...editing, categoryId: Number(v) })}>
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
                <Label>菜品图片</Label>
                <ImageUpload value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>描述</Label>
              <Textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>口味选项</Label>
                <Button variant="ghost" size="sm" onClick={addFlavor}><Plus size={14} strokeWidth={1.5} /> 添加口味</Button>
              </div>
              {(editing.flavors ?? []).map((f, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-md border border-line p-3">
                  <div className="flex flex-1 flex-col gap-2">
                    <Input
                      placeholder="口味名称（如辣度）"
                      value={f.name}
                      onChange={(e) => updateFlavor(idx, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="口味值，用逗号分隔（如不辣,微辣,中辣）"
                      value={parseJsonArray(f.value).join(',')}
                      onChange={(e) => updateFlavorValues(idx, e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeFlavor(idx)}>
                    <X size={14} strokeWidth={1.5} className="text-danger" />
                  </Button>
                </div>
              ))}
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
        title={confirmAction === 'delete' ? '删除菜品' : confirmTarget?.status === 1 ? '起售菜品' : '停售菜品'}
        description={confirmAction === 'delete' ? '删除后不可恢复，确认删除？' : confirmTarget?.status === 1 ? '确认起售该菜品？' : '确认停售该菜品？'}
        confirmLabel={confirmAction === 'delete' ? '删除' : confirmTarget?.status === 1 ? '起售' : '停售'}
        danger={confirmAction === 'delete' || confirmTarget?.status === 0}
        onConfirm={doConfirm}
      />
    </div>
  )
}
