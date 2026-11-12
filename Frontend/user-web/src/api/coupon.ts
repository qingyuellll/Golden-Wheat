import { apiGet, apiPost } from '@/lib/request'
import type {
  CouponVO,
  UserCouponVO,
  AvailableCouponVO,
  OptimalCouponVO,
  CouponCalculateDTO,
  CouponPreviewVO,
} from '@/types/api'

export const couponApi = {
  available: () => apiGet<CouponVO[]>('/coupon/available'),
  receive: (couponId: number) => apiPost<void>(`/coupon/receive/${couponId}`),
  exchange: (code: string) => apiPost<void>(`/coupon/exchange/${code}`),
  my: (status?: 1 | 2 | 3) =>
    apiGet<UserCouponVO[]>('/coupon/my', status ? { status } : undefined),
  calculate: (data: CouponCalculateDTO) =>
    apiPost<AvailableCouponVO[]>('/coupon/calculate', data),
  optimal: (data: CouponCalculateDTO) =>
    apiPost<OptimalCouponVO>('/coupon/optimal', data),
  /** 组合试算：与下单锁定同口径，勾选变化时实时刷新精确优惠 */
  preview: (data: CouponCalculateDTO) =>
    apiPost<CouponPreviewVO>('/coupon/preview', data),
}
