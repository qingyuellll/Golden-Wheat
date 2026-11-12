import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, MapPin, Star, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { addressApi } from '@/api/address'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { AddressBook } from '@/types/api'

const EMPTY_ADDR: Omit<AddressBook, 'id' | 'createTime' | 'updateTime'> = {
  consignee: '',
  phone: '',
  sex: '1',
  provinceCode: '',
  provinceName: '',
  cityCode: '',
  cityName: '',
  districtCode: '',
  districtName: '',
  detail: '',
  label: '',
  isDefault: 0,
}

export function AddressPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 选用模式：从结算页"切换地址"进入，点击卡片即选定并返回
  const selectMode = searchParams.get('select') === '1'
  const [addresses, setAddresses] = useState<AddressBook[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AddressBook | null>(null)
  const [form, setForm] = useState(EMPTY_ADDR)

  /** 选用模式下点击卡片：记录所选地址并返回结算页 */
  const pickAddress = (addr: AddressBook) => {
    if (!selectMode) return
    sessionStorage.setItem('gw-selected-address-id', String(addr.id))
    navigate('/checkout')
  }

  const load = () => {
    addressApi.list().then(setAddresses).catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_ADDR)
    setDialogOpen(true)
  }

  const openEdit = (addr: AddressBook) => {
    setEditing(addr)
    setForm(addr)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.consignee || !form.phone || !form.detail) {
      toast.error('请填写收货人、手机号和详细地址')
      return
    }
    try {
      if (editing) {
        await addressApi.update({ ...form, id: editing.id } as AddressBook)
        toast.success('地址已更新')
      } else {
        await addressApi.create(form)
        toast.success('地址已添加')
      }
      setDialogOpen(false)
      load()
    } catch {
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await addressApi.delete(id)
      toast.success('地址已删除')
      load()
    } catch {
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await addressApi.setDefault(id)
      toast.success('已设为默认地址')
      load()
    } catch {
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-lg text-ink">收货地址</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} strokeWidth={1.5} /> 新增
        </Button>
      </div>

      {selectMode && addresses.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-primary bg-primary-soft/40 px-4 py-2.5 text-sm text-primary">
          <CheckCircle2 size={16} strokeWidth={1.5} />
          点击地址卡片即可选用，并返回结算页
        </div>
      )}

      {addresses.length === 0 ? (
        <Empty
          title="暂无收货地址"
          description="请添加一个收货地址"
          icon={<MapPin size={20} strokeWidth={1.5} />}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={cn(
                'transition-all duration-500 ease-plant hover:-translate-y-0.5 hover:border-primary/40',
                selectMode && 'cursor-pointer hover:border-primary',
              )}
              onClick={() => pickAddress(addr)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                  <MapPin size={16} strokeWidth={1.5} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">{addr.consignee}</p>
                    <span className="text-xs text-muted">{addr.phone}</span>
                    {addr.isDefault === 1 && <Badge variant="primary">默认</Badge>}
                    {addr.label && <Badge variant="secondary">{addr.label}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {addr.provinceName}{addr.cityName}{addr.districtName}{addr.detail}
                  </p>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {selectMode && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mr-1"
                      onClick={() => pickAddress(addr)}
                    >
                      选用
                    </Button>
                  )}
                  {addr.isDefault !== 1 && (
                    <Button variant="ghost" size="icon-sm" onClick={() => handleSetDefault(addr.id)} aria-label="设为默认">
                      <Star size={14} strokeWidth={1.5} />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(addr)} aria-label="编辑">
                    <Pencil size={14} strokeWidth={1.5} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(addr.id)} aria-label="删除">
                    <Trash2 size={14} strokeWidth={1.5} className="text-danger" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑地址' : '新增地址'}</DialogTitle>
            <DialogDescription>请填写收货地址信息</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-6 pb-4">
            <Field label="收货人">
              <Input value={form.consignee} onChange={(e) => setForm({ ...form, consignee: e.target.value })} />
            </Field>
            <Field label="手机号">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <div className="flex gap-3">
              <div className="flex-1">
                <Field label="省">
                  <Input value={form.provinceName} onChange={(e) => setForm({ ...form, provinceName: e.target.value })} />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="市">
                  <Input value={form.cityName} onChange={(e) => setForm({ ...form, cityName: e.target.value })} />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="区">
                  <Input value={form.districtName} onChange={(e) => setForm({ ...form, districtName: e.target.value })} />
                </Field>
              </div>
            </div>
            <Field label="详细地址">
              <Input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
            </Field>
            <Field label="标签">
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder={'如：家、公司'} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
