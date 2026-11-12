import { apiGet, apiPut } from '@/lib/request'

export const shopApi = {
  getStatus: () => apiGet<number>('/shop/status'),
  setStatus: (status: 0 | 1) => apiPut<void>(`/shop/${status}`),
}
