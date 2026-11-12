import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/request'
import type {
  Category,
  CategoryDTO,
  CategoryPageQuery,
  PageResult,
} from '@/types/api'

export const categoryApi = {
  create: (data: CategoryDTO) => apiPost<void>('/category', data),
  page: (params: CategoryPageQuery) =>
    apiGet<PageResult<Category>>('/category/page', params),
  delete: (id: number) => apiDelete<void>('/category', { id }),
  update: (data: CategoryDTO) => apiPut<void>('/category', data),
  toggleStatus: (id: number, status: 0 | 1) =>
    apiPost<void>(`/category/status/${status}`, undefined, { params: { id } }),
  /** 按类型查启用分类：1 菜品 / 2 套餐（用于下拉） */
  listByType: (type: 1 | 2) => apiGet<Category[]>('/category/list', { type }),
}
