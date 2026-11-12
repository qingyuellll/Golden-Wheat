import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react'
import { categoryApi } from '@/api/category'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Pagination } from '@/components/ui/pagination'
import { Empty } from '@/components/ui/empty'
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
import { formatDateTime } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { Category, CategoryDTO } from '@/types/api'

const TYPE_OPTIONS = [
  { value: 1, label: '菜品分类' },
  { value: 2, label: '套餐分类' },
]

const emptyForm: CategoryDTO = { type: 1, name: '', sort: 1 }

export function CategoryPage() {
  const { page, pageSize, setPage, reset } = usePagination()
  const [nameFilter, setNameFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined)
  const [searchName, setSearchName] = useState('')
  const [searchType, setSearchType] = useState<number | undefined>(undefined)
  const [records, setRecords] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryDTO>(emptyForm)
  const [isEdit, setIsEdit] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'toggle' | 'delete'>('toggle')
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; status?: 0 | 1 } | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await categoryApi.page({
        page, pageSize,
        name: searchName || undefined,
        type: searchType,
      })
      setRecords(res.records)
      setTotal(res.total)
    } catch {
      // interceptor handles
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchName, searchType])

  useEffect(() => { fetch() }, [fetch])

  const handleSearch = () => {
    setSearchName(nameFilter)
    setSearchType(typeFilter)
    reset()
  }

  const openAdd = () => {
    setEditing(emptyForm)
    setIsEdit(false)
    setFormOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing({ id: cat.id, type: cat.type, name: cat.name, sort: cat.sort })
    setIsEdit(true)
    setFormOpen(true)
  }

  const submitForm = async () => {
    if (!editing.name) {
      toast.error('请填写分类名称')
      return
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await categoryApi.update(editing)
        toast.success('分类已更新')
      } else {
        await categoryApi.create(editing)
        toast.success('分类已添加')
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
        await categoryApi.toggleStatus(confirmTarget.id, confirmTarget.status)
        toast.success(confirmTarget.status === 1 ? '已启用' : '已禁用')
      } else if (confirmAction === 'delete') {
        await categoryApi.delete(confirmTarget.id)
        toast.success('分类已删除')
      }
      fetch()
    } catch {
      // interceptor handles
    } finally {
      setConfirmOpen(false)
      setConfirmTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="分类管理"
        description="菜品 / 套餐分类的增删改查与启停"
        actions={<Button onClick={openAdd}><Plus size={16} strokeWidth={1.5} /> 新增分类</Button>}
      />

      <div className="card-border p-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="搜索分类名称"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-60"
          />
          <Select
            value={typeFilter?.toString() ?? ''}
            onValueChange={(v) => setTypeFilter(v ? Number(v) : undefined)}
          >
            <SelectTrigger className="w-36"><SelectValue placeholder="全部类型" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部类型</SelectItem>
              {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value.toString()}>{o.label}</SelectItem>)}
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
              <TableHead>分类名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted">加载中…</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={6}><Empty title="暂无分类数据" /></TableCell></TableRow>
            ) : records.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.type === 1 ? '菜品' : '套餐'}</TableCell>
                <TableCell>{cat.sort}</TableCell>
                <TableCell><StatusBadge status={cat.status as 0 | 1} /></TableCell>
                <TableCell>{formatDateTime(cat.updateTime)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={cat.status === 1}
                      onCheckedChange={(checked) => {
                        setConfirmAction('toggle')
                        setConfirmTarget({ id: cat.id, status: checked ? 1 : 0 })
                        setConfirmOpen(true)
                      }}
                    />
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)}>
                      <Pencil size={14} strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost" size="icon-sm"
                      onClick={() => {
                        setConfirmAction('delete')
                        setConfirmTarget({ id: cat.id })
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑分类' : '新增分类'}</DialogTitle>
            <DialogDescription>{isEdit ? '修改分类信息' : '创建菜品或套餐分类'}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-6 pb-4">
            <div className="flex flex-col gap-2">
              <Label>分类类型</Label>
              <Select
                value={editing.type.toString()}
                onValueChange={(v) => setEditing({ ...editing, type: Number(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value.toString()}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>分类名称</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>排序</Label>
              <Input type="number" value={editing.sort ?? 1} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) || 1 })} />
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
        title={confirmAction === 'delete' ? '删除分类' : confirmTarget?.status === 1 ? '启用分类' : '禁用分类'}
        description={confirmAction === 'delete' ? '删除后不可恢复，确认删除？' : confirmTarget?.status === 1 ? '确认启用该分类？' : '确认禁用该分类？'}
        confirmLabel={confirmAction === 'delete' ? '删除' : confirmTarget?.status === 1 ? '启用' : '禁用'}
        danger={confirmAction === 'delete' || confirmTarget?.status === 0}
        onConfirm={doConfirm}
      />
    </div>
  )
}
