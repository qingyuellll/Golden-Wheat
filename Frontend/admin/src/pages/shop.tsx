import { useState, useEffect } from 'react'
import { Loader2, Store, Moon } from 'lucide-react'
import { shopApi } from '@/api/shop'
import { PageHeader } from '@/components/PageHeader'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

export function ShopPage() {
  const [status, setStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    shopApi.getStatus()
      .then((s) => setStatus(s))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (open: boolean) => {
    setSwitching(true)
    try {
      await shopApi.setStatus(open ? 1 : 0)
      setStatus(open ? 1 : 0)
      toast.success(open ? '店铺已营业' : '店铺已打烊')
    } catch {
      // interceptor handles
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="店铺设置" description="管理店铺营业状态" />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-muted" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>营业状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Switch
                  checked={status === 1}
                  onCheckedChange={toggle}
                  disabled={switching}
                />
                <div className="flex items-center gap-2">
                  {status === 1 ? (
                    <>
                      <Store size={20} strokeWidth={1.5} className="text-primary" />
                      <span className="text-ink">营业中</span>
                    </>
                  ) : (
                    <>
                      <Moon size={20} strokeWidth={1.5} className="text-muted" />
                      <span className="text-muted">已打烊</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>状态说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-ink">营业中：用户端可正常下单</p>
                <p className="text-muted">已打烊：用户端暂停接单</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
