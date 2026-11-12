import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/request'
import type { Dish, DishDTO, DishPageQuery, DishVO, PageResult } from '@/types/api'

export const dishApi = {
  create: (data: DishDTO) => apiPost<void>('/dish', data),
  page: (params: DishPageQuery) =>
    apiGet<PageResult<DishVO>>('/dish/page', params),
  remove: (ids: number[]) =>
    apiDelete<void>('/dish', { ids }).then(() => undefined),
  detail: (id: number) => apiGet<DishVO>(`/dish/${id}`),
  update: (data: DishDTO) => apiPut<void>('/dish', data),
  toggleStatus: (id: number, status: 0 | 1) =>
    apiPost<void>(`/dish/status/${status}`, undefined, { params: { id } }),
  listByCategory: (categoryId: number) =>
    apiGet<Dish[]>('/dish/list', { categoryId }),
}
