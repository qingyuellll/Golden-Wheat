import { apiGet } from '@/lib/request'
import type { Category } from '@/types/api'

export const categoryApi = {
  list: (type?: 1 | 2) => apiGet<Category[]>('/category/list', type ? { type } : undefined),
}
