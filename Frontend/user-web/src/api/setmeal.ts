import { apiGet } from '@/lib/request'
import type { Setmeal, DishItemVO } from '@/types/api'

export const setmealApi = {
  listByCategory: (categoryId: number) => apiGet<Setmeal[]>('/setmeal/list', { categoryId }),
  getById: (id: number) => apiGet<Setmeal>(`/setmeal/${id}`),
  getDishes: (id: number) => apiGet<DishItemVO[]>(`/setmeal/dish/${id}`),
}
