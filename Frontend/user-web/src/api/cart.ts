import { apiGet, apiPost, apiDelete } from '@/lib/request'
import type { ShoppingCart, ShoppingCartDTO } from '@/types/api'

export const cartApi = {
  add: (data: ShoppingCartDTO) => apiPost<void>('/shoppingCart/add', data),
  list: () => apiGet<ShoppingCart[]>('/shoppingCart/list'),
  sub: (data: ShoppingCartDTO) => apiPost<void>('/shoppingCart/sub', data),
  clean: () => apiDelete<void>('/shoppingCart/clean'),
}
