import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Loader2 } from 'lucide-react'
import { employeeApi } from '@/api/employee'
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
import type { Employee, EmployeeDTO } from '@/types/api'

const SEX_OPTIONS = [
  { value: '男', label: '男' },
  { value: '女', label: '女' },
]

const emptyForm: EmployeeDTO = { username: '', name: '', phone: '', sex: '男', idNumber: '' }

export function EmployeePage() {
  const { page, pageSize, setPage, reset } = usePagination()
  const [nameFilter, setNameFilter] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [records, setRecords] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EmployeeDTO>(emptyForm)
  const [isEdit, setIsEdit] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; status: 0 | 1 } | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await employeeApi.page({ page, pageSize, name: searchKey || undefined })
      setRecords(res.records)
      setTotal(res.total)
    } catch {
      // interceptor handles
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchKey])

  useEffect(() => { fetch() }, [fetch])

  const handleSearch = () => {
    setSearchKey(nameFilter)
    reset()
  }

  const openAdd = () => {
    setEditing(emptyForm)
    setIsEdit(false)
    setFormOpen(true)
  }

  const openEdit = async (emp: Employee) => {
    try {
      const detail = await employeeApi.detail(emp.id)
      setEditing({
        id: detail.id,
        username: detail.username,
        name: detail.name,
        phone: detail.phone,
        sex: detail.sex,
        idNumber: detail.idNumber,
      })
      setIsEdit(true)
      setFormOpen(true)
    } catch {
      // interceptor handles
    }
  }

  const submitForm = async () => {
    if (!editing.username || !editing.name || !editing.phone || !editing.idNumber) {
      toast.error('请填写完整信息')
      return
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await employeeApi.update(editing)
        toast.success('员工信息已更新')
      } else {
        await employeeApi.create(editing)
        toast.success('员工已添加')
      }
      setFormOpen(false)
      fetch()
    } catch {
      // interceptor handles
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async () => {
    if (!confirmTarget) return
    try {
      await employeeApi.toggleStatus(confirmTarget.id, confirmTarget.status)
      toast.success(confirmTarget.status === 1 ? '已启用' : '已禁用')
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
        title="员工管理"
        description="后台员工的增删改查与启停"
        actions={<Button onClick={openAdd}><Plus size={16} strokeWidth={1.5} /> 新增员工</Button>}
      />

      <div className="card-border p-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="搜索员工姓名"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-60"
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search size={16} strokeWidth={1.5} /> 查询
          </Button>
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>员工姓名</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>性别</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted">加载中…</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={7}><Empty title="暂无员工数据" /></TableCell></TableRow>
            ) : records.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.username}</TableCell>
                <TableCell>{emp.phone}</TableCell>
                <TableCell>{emp.sex}</TableCell>
                <TableCell><StatusBadge status={emp.status as 0 | 1} /></TableCell>
                <TableCell>{formatDateTime(emp.createTime)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={emp.status === 1}
                      onCheckedChange={(checked) => {
                        setConfirmTarget({ id: emp.id, status: checked ? 1 : 0 })
                        setConfirmOpen(true)
                      }}
                    />
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(emp)}>
                      <Pencil size={14} strokeWidth={1.5} />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑员工' : '新增员工'}</DialogTitle>
            <DialogDescription>{isEdit ? '修改员工基本信息' : '填写新员工信息，密码默认 123456'}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-6 pb-4">
            <Field label="用户名">
              <Input value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} />
            </Field>
            <Field label="姓名">
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="手机号">
              <Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
            </Field>
            <Field label="性别">
              <Select value={editing.sex} onValueChange={(v) => setEditing({ ...editing, sex: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="身份证号">
              <Input value={editing.idNumber} onChange={(e) => setEditing({ ...editing, idNumber: e.target.value })} />
            </Field>
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
        title={confirmTarget?.status === 1 ? '启用员工' : '禁用员工'}
        description={confirmTarget?.status === 1 ? '确认启用该员工账号？' : '确认禁用该员工账号？禁用后该员工将无法登录。'}
        confirmLabel={confirmTarget?.status === 1 ? '启用' : '禁用'}
        danger={confirmTarget?.status === 0}
        onConfirm={toggleStatus}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
