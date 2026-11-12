import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { addressApi } from '@/api/address'
import { cartApi } from '@/api/cart'
import { orderApi } from '@/api/order'
import { couponApi } from '@/api/coupon'
import { shopApi } from '@/api/shop'
import { useCartStore } from '@/store/cart'
import { formatMoney, cn, toDateTimeString } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { AddressBook, AvailableCouponVO } from '@/types/api'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const setCartItems = useCartStore((s) => s.setItems)
  const [selectedAddr, setSelectedAddr] = useState<AddressBook | null>(null)
  const [deliveryStatus, setDeliveryStatus] = useState(1)
  const [estTime, setEstTime] = useState('')
  const [remark, setRemark] = useState('')
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCouponVO[]>([])
  const [selectedCouponIds, setSelectedCouponIds] = useState<number[]>([])
  /** 组合试算明细：每张券在组合中的实算优惠（与下单锁定同口径） */
  const [previewDetail, setPreviewDetail] = useState<{ userCouponId: number; name: string; discount: number; skipped: boolean }[]>([])
  const [optimalLoading, setOptimalLoading] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [packFee, setPackFee] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const totalAmount = items.reduce((sum, i) => sum + i.amount * i.number, 0)
  // 与服务端口径一致：应付 = 商品小计 + 打包费 - 优惠，最低为 0
  const payAmount = Math.max(0, totalAmount + packFee - discountAmount)

  // StrictMode 下 effect 会执行两次：用 ref 保证"选用回传的地址"只被消费一次，
  // 回退逻辑用函数式更新，避免第二次执行时把已选地址覆盖回默认地址
  const addressConsumedRef = useRef(false)

  useEffect(() => {
    addressApi.list().then((list) => {
      // 地址页"选用模式"带回的选择优先（点卡片返回时写入 sessionStorage）
      if (!addressConsumedRef.current) {
        addressConsumedRef.current = true
        const pickedId = Number(sessionStorage.getItem('gw-selected-address-id'))
        const picked = pickedId ? list.find((a) => a.id === pickedId) : undefined
        sessionStorage.removeItem('gw-selected-address-id')
        if (picked) {
          setSelectedAddr(picked)
          return
        }
      }
      // 默认地址兜底：仅在当前没有选中地址时生效
      setSelectedAddr((prev) => {
        if (prev) return prev
        const def = list.find((a) => a.isDefault === 1)
        if (def) return def
        return list[0] ?? null
      })
    }).catch(() => {})
    // 打包费由服务端按配置收取，这里取同一份配置用于展示，避免显示金额与实付不一致
    shopApi.getConfig().then((cfg) => setPackFee(Number(cfg.packFee) || 0)).catch(() => {})
  }, [])

  useEffect(() => {
    if (items.length === 0) return
    const calculateItems = items.map((i) => ({
      itemId: i.dishId ?? i.setmealId ?? 0,
      itemType: i.dishId ? 1 : 2,
      // 分类由服务端按商品补齐，用于判定"指定商品券"的适用范围
      price: i.amount,
      quantity: i.number,
    }))
    setCalcItems(calculateItems)
    couponApi.calculate({ items: calculateItems }).then(setAvailableCoupons).catch(() => {})
  }, [items])

  // 计算参数缓存：组合试算与最优组合共用
  const [calcItems, setCalcItems] = useState<{ itemId: number; itemType: number; price: number; quantity: number }[]>([])

  // 勾选组合变化 → 调后端组合试算（与下单锁定同一核销口径），优惠金额以后端为准
  useEffect(() => {
    if (calcItems.length === 0) return
    if (selectedCouponIds.length === 0) {
      setDiscountAmount(0)
      setPreviewDetail([])
      return
    }
    let cancelled = false
    couponApi.preview({ items: calcItems, userCouponIds: selectedCouponIds }).then((res) => {
      if (cancelled) return
      setDiscountAmount(Number(res.totalDiscount) || 0)
      setPreviewDetail(res.coupons ?? [])
    }).catch(() => {})
    return () => { cancelled = true }
  }, [selectedCouponIds, calcItems])

  // 一键最优组合：调策略工厂全排列接口，自动勾选最优券组合。
  // silent=true 用于进入结算页时自动应用（无组合不弹提示）
  const applyOptimal = async (silent: boolean) => {
    if (calcItems.length === 0) return
    setOptimalLoading(true)
    try {
      const opt = await couponApi.optimal({ items: calcItems })
      if (!opt.userCouponIds || opt.userCouponIds.length === 0) {
        if (!silent) toast.info('当前订单没有可用的优惠券组合')
        return
      }
      setSelectedCouponIds(opt.userCouponIds)
      setDiscountAmount(Number(opt.totalDiscount) || 0)
      if (!silent) toast.success(`已为你推荐最优组合，共优惠 ${formatMoney(opt.totalDiscount)}`)
    } catch {
      // interceptor handles
    } finally {
      setOptimalLoading(false)
    }
  }

  // 默认自动应用最优组合：可用券加载完成后静默调用策略工厂，
  // 有最优组合就直接勾选；用户之后可手动改选（改动后仍以后端试算金额为准）
  useEffect(() => {
    if (availableCoupons.length > 0 && calcItems.length > 0 && selectedCouponIds.length === 0) {
      applyOptimal(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCoupons, calcItems])

  const handleSubmit = async () => {
    if (!selectedAddr) {
      toast.error('请选择收货地址')
      return
    }
    setSubmitting(true)
    try {
      const res = await orderApi.submit({
        addressBookId: selectedAddr.id,
        payMethod: 1,
        remark,
        estimatedDeliveryTime: deliveryStatus === 0 ? toDateTimeString(estTime) : undefined,
        deliveryStatus,
        tablewareNumber: 1,
        tablewareStatus: 1,
        userCouponIds: selectedCouponIds.length > 0 ? selectedCouponIds : undefined,
      })
      toast.success('下单成功')
      try {
        await orderApi.payment({ orderNumber: res.orderNumber, payMethod: 1 })
        toast.success('支付成功')
      } catch {
      }
      const cartList = await cartApi.list()
      setCartItems(cartList)
      navigate(`/order/${res.id}`)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Empty title="购物车是空的" description="请先添加菜品" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-muted transition-colors duration-300 hover:text-primary"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> 返回
      </button>

      <h1 className="font-serif text-lg text-ink">确认订单</h1>

      <div className="mt-6 flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin size={16} strokeWidth={1.5} className="text-primary" /> 收货地址
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAddr ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-ink">
                  {selectedAddr.consignee} · {selectedAddr.phone}
                </p>
                <p className="text-xs text-muted">
                  {selectedAddr.provinceName}{selectedAddr.cityName}{selectedAddr.districtName}{selectedAddr.detail}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 self-start p-0"
                  onClick={() => navigate('/address?select=1')}
                >
                  切换地址
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">暂无收货地址</p>
                <Button variant="link" size="sm" onClick={() => navigate('/address?select=1')}>
                  新增地址
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={16} strokeWidth={1.5} className="text-primary" /> 配送方式
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => setDeliveryStatus(1)}
                className={cn(
                  'rounded-md border px-4 py-2 text-sm transition-all duration-300',
                  deliveryStatus === 1
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line text-ink hover:border-primary/40',
                )}
              >
                立即送出
              </button>
              <button
                onClick={() => setDeliveryStatus(0)}
                className={cn(
                  'rounded-md border px-4 py-2 text-sm transition-all duration-300',
                  deliveryStatus === 0
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line text-ink hover:border-primary/40',
                )}
              >
                选择时间
              </button>
            </div>
            {deliveryStatus === 0 && (
              <Input
                type="datetime-local"
                value={estTime}
                onChange={(e) => setEstTime(e.target.value)}
                placeholder="选择送达时间"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">订单详情</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-10 w-10 shrink-0 rounded-sm object-cover"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-ink">{item.name}</p>
                  {item.dishFlavor && <p className="text-xs text-muted">{item.dishFlavor}</p>}
                </div>
                <span className="text-xs text-muted">x{item.number}</span>
                <span className="text-sm text-ink">{formatMoney(item.amount * item.number)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {availableCoupons.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>优惠券</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => applyOptimal(false)}
                  disabled={optimalLoading}
                >
                  {optimalLoading ? '计算中...' : '一键最优组合'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {availableCoupons.map((c) => {
                // 优惠金额展示组合试算结果（勾选后为准），未勾选时展示单券参考值
                const preview = previewDetail.find((p) => p.userCouponId === c.userCouponId)
                const shownDiscount = preview ? preview.discount : c.discountAmount
                const isSelected = selectedCouponIds.includes(c.userCouponId)
                return (
                <button
                  key={c.userCouponId}
                  onClick={() => {
                    if (!c.canUse) return
                    const isSelectedNow = selectedCouponIds.includes(c.userCouponId)
                    if (isSelectedNow) {
                      setSelectedCouponIds((prev) => prev.filter((id) => id !== c.userCouponId))
                    } else {
                      // 与后端 MAX_STACKED_COUPONS 同一口径：单笔订单最多叠加 2 张
                      if (selectedCouponIds.length >= 2) {
                        toast.info('单笔订单最多叠加 2 张优惠券，可取消一张后再选')
                        return
                      }
                      setSelectedCouponIds((prev) => [...prev, c.userCouponId])
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-md border p-3 text-left transition-all duration-300',
                    !c.canUse && 'opacity-50 cursor-not-allowed',
                    c.canUse && isSelected
                      ? 'border-primary bg-primary-soft'
                      : 'border-line hover:border-primary/40',
                  )}
                  disabled={!c.canUse}
                >
                  <div className="flex-1">
                    <p className="text-sm text-ink">{c.name}</p>
                    <p className="text-xs text-muted">{c.ruleDesc}</p>
                    {isSelected && preview?.skipped && (
                      <p className="mt-0.5 text-xs text-danger">未达门槛，本单暂不生效</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {preview ? `-${formatMoney(shownDiscount)}` : `-${formatMoney(c.discountAmount)}`}
                  </span>
                </button>
                )
              })}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="remark">备注</Label>
            <Input
              id="remark"
              placeholder="口味偏好、特殊要求等"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted">
                共 {items.reduce((sum, i) => sum + i.number, 0)} 件 · 商品 {formatMoney(totalAmount)}
                {packFee > 0 && ` · 打包费 ${formatMoney(packFee)}`}
                {discountAmount > 0 && ` · 优惠 -${formatMoney(discountAmount)}`}
              </p>
              <p className="text-md font-medium text-primary">{formatMoney(payAmount)}</p>
              <p className="text-xs text-muted">最终金额以服务端核算为准</p>
            </div>
            <Button size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '提交中…' : '提交订单'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
