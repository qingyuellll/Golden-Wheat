import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/request'
import type {
  CouponDTO,
  CouponPageQuery,
  CouponVO,
  PageResult,
} from '@/types/api'

export const couponApi = {
  create: (data: CouponDTO) => apiPost<void>('/coupon', data),
  publish: (id: number) => apiPut<void>(`/coupon/publish/${id}`),
  stop: (id: number) => apiPut<void>(`/coupon/stop/${id}`),
  page: (params: CouponPageQuery) =>
    apiGet<PageResult<CouponVO>>('/coupon/page', params),
  detail: (id: number) => apiGet<CouponVO>(`/coupon/${id}`),
  delete: (id: number) => apiDelete<void>(`/coupon/${id}`),
  batchDelete: (ids: number[]) =>
    apiDelete<void>('/coupon/batch', { ids }).then(() => undefined),
  update: (data: CouponDTO) => apiPut<void>('/coupon', data),
  remove: (id: number) => apiDelete<void>(`/coupon/${id}`),
}
