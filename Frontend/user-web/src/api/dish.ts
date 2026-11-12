import { apiGet } from '@/lib/request'
import type { DishVO } from '@/types/api'

export const dishApi = {
  /** 详情返回 DishVO（含口味），C 端详情页据此渲染规格选项 */
  getById: (id: number) => apiGet<DishVO>(`/dish/${id}`),
  listByCategory: (categoryId: number) => apiGet<DishVO[]>('/dish/list', { categoryId }),
}
