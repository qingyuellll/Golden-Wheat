import { apiGet, apiPost, apiPut } from '@/lib/request'
import type {
  OrderVO,
  OrderSubmitDTO,
  OrderSubmitVO,
  OrderPaymentDTO,
  OrderPaymentVO,
  PageResult,
  OrdersPageQuery,
} from '@/types/api'

export const orderApi = {
  submit: (data: OrderSubmitDTO) => apiPost<OrderSubmitVO>('/order/submit', data),
  payment: (data: OrderPaymentDTO) => apiPut<OrderPaymentVO>('/order/payment', data),
  history: (params: OrdersPageQuery) =>
    apiGet<PageResult<OrderVO>>('/order/historyOrders', params),
  detail: (id: number) => apiGet<OrderVO>(`/order/orderDetail/${id}`),
  cancel: (id: number) => apiPut<void>(`/order/cancel/${id}`),
  repetition: (id: number) => apiPost<void>(`/order/repetition/${id}`),
  reminder: (id: number) => apiGet<void>(`/order/reminder/${id}`),
}
