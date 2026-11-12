import { apiGet, apiPut } from '@/lib/request'
import type {
  OrderStatistics,
  OrderVO,
  OrdersCancelDTO,
  OrdersConfirmDTO,
  OrdersPageQuery,
  OrdersRejectionDTO,
  PageResult,
} from '@/types/api'

export const orderApi = {
  search: (params: OrdersPageQuery) =>
    apiGet<PageResult<OrderVO>>('/order/conditionSearch', params),
  statistics: () => apiGet<OrderStatistics>('/order/statistics'),
  detail: (id: number) => apiGet<OrderVO>(`/order/details/${id}`),
  confirm: (data: OrdersConfirmDTO) => apiPut<void>('/order/confirm', data),
  reject: (data: OrdersRejectionDTO) => apiPut<void>('/order/rejection', data),
  cancel: (data: OrdersCancelDTO) => apiPut<void>('/order/cancel', data),
  delivery: (id: number) => apiPut<void>(`/order/delivery/${id}`),
  complete: (id: number) => apiPut<void>(`/order/complete/${id}`),
}
