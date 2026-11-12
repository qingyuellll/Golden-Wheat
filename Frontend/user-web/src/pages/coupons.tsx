import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { couponApi } from '@/api/coupon'
import { useAuthStore } from '@/store/auth'
import { formatDate, cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { CouponVO, UserCouponVO } from '@/types/api'

type Tab = 'available' | 'my'

export function CouponsPage() {
  const isAuth = useAuthStore((s) => s.isAuthenticated())
  const [tab, setTab] = useState<Tab>('available')
  const [available, setAvailable] = useState<CouponVO[]>([])
  const [myCoupons, setMyCoupons] = useState<UserCouponVO[]>([])
  const [exchangeCode, setExchangeCode] = useState('')

  useEffect(() => {
    couponApi.available().then(setAvailable).catch(() => {})
  }, [])

  useEffect(() => {
    // 我的优惠券属于登录态数据，游客不请求，避免 401 跳登录
    if (tab !== 'my' || !isAuth) return
    couponApi.my().then(setMyCoupons).catch(() => {})
  }, [tab, isAuth])

  const handleReceive = async (couponId: number) => {
    try {
      await couponApi.receive(couponId)
      toast.success('领取成功')
      const list = await couponApi.available()
      setAvailable(list)
    } catch {
    }
  }

  const handleExchange = async () => {
    if (!exchangeCode.trim()) {
      toast.error('请输入兑换码')
      return
    }
    try {
      await couponApi.exchange(exchangeCode)
      toast.success('兑换成功')
      setExchangeCode('')
      const list = await couponApi.available()
      setAvailable(list)
    } catch {
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-lg text-ink">优惠券</h1>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setTab('available')}
          className={cn(
            'rounded-md px-4 py-2 text-sm transition-colors duration-300',
            tab === 'available'
              ? 'bg-primary-soft text-primary font-medium'
              : 'text-muted hover:text-primary',
          )}
        >
          可领取
        </button>
        <button
          onClick={() => setTab('my')}
          className={cn(
            'rounded-md px-4 py-2 text-sm transition-colors duration-300',
            tab === 'my'
              ? 'bg-primary-soft text-primary font-medium'
              : 'text-muted hover:text-primary',
          )}
        >
          我的优惠券
        </button>
      </div>

      {tab === 'available' && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex gap-3">
            <Input
              value={exchangeCode}
              onChange={(e) => setExchangeCode(e.target.value)}
              placeholder="输入兑换码"
              className="max-w-xs"
            />
            <Button variant="outline" onClick={handleExchange}>兑换</Button>
          </div>

          {available.length === 0 ? (
            <Empty title="暂无可领取优惠券" icon={<Tag size={20} strokeWidth={1.5} />} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {available.map((c) => (
                <Card key={c.id} className="overflow-hidden transition-all duration-500 ease-plant hover:-translate-y-1 hover:border-primary/40">
                  <div className="flex">
                    <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-primary text-surface">
                      <span className="text-xs">{c.typeDesc}</span>
                      <span className="text-lg font-medium">
                        {c.discountType === 3 ? `${c.discountValue}折` : `¥${c.discountValue}`}
                      </span>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <p className="text-sm font-medium text-ink">{c.name}</p>
                      <p className="mt-1 text-xs text-muted">{c.ruleDesc}</p>
                      <p className="mt-1 text-xs text-muted">{c.validityDesc}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline">{c.scopeDesc}</Badge>
                        <Button
                          size="sm"
                          variant={c.received ? 'ghost' : 'primary'}
                          disabled={c.received || c.remainNum <= 0}
                          onClick={() => handleReceive(c.id)}
                        >
                          {c.received ? '已领取' : c.remainNum <= 0 ? '已领完' : '领取'}
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'my' && (
        <div className="mt-6">
          {!isAuth ? (
            <Empty
              title="登录后查看我的优惠券"
              description="已领取的券会保存在账户里"
              icon={<Gift size={20} strokeWidth={1.5} />}
              action={
                <Link to="/login">
                  <Button variant="outline">去登录</Button>
                </Link>
              }
            />
          ) : myCoupons.length === 0 ? (
            <Empty title="暂无优惠券" icon={<Gift size={20} strokeWidth={1.5} />} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myCoupons.map((c) => (
                <Card
                  key={c.id}
                  className={cn(
                    'overflow-hidden transition-all duration-500 ease-plant',
                    c.status === 1 && 'hover:-translate-y-1 hover:border-primary/40',
                    c.status !== 1 && 'opacity-60',
                  )}
                >
                  <div className="flex">
                    <div
                      className={cn(
                        'flex w-24 shrink-0 flex-col items-center justify-center',
                        c.status === 1 ? 'bg-primary text-surface' : 'bg-muted text-muted',
                      )}
                    >
                      <span className="text-xs">
                        {c.status === 1 ? '可用' : c.status === 2 ? '已用' : '过期'}
                      </span>
                      <span className="text-lg font-medium">¥{c.discountValue}</span>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <p className="text-sm font-medium text-ink">{c.couponName}</p>
                      <p className="mt-1 text-xs text-muted">{c.ruleDesc}</p>
                      <p className="mt-1 text-xs text-muted">
                        有效期至 {formatDate(c.termEndTime)}
                      </p>
                      {c.expiringSoon && c.status === 1 && (
                        <Badge variant="warn" className="mt-1">即将过期</Badge>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
