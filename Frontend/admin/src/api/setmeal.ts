import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/request'
import type {
  SetmealDTO,
  SetmealPageQuery,
  SetmealVO,
  PageResult,
} from '@/types/api'

export const setmealApi = {
  create: (data: SetmealDTO) => apiPost<void>('/setmeal', data),
  page: (params: SetmealPageQuery) =>
    apiGet<PageResult<SetmealVO>>('/setmeal/page', params),
  batchDelete: (ids: number[]) =>
    apiDelete<void>('/setmeal', { ids }).then(() => undefined),
  detail: (id: number) => apiGet<SetmealVO>(`/setmeal/${id}`),
  update: (data: SetmealDTO) => apiPut<void>('/setmeal', data),
  toggleStatus: (id: number, status: 0 | 1) =>
    apiPost<void>(`/setmeal/status/${status}`, undefined, { params: { id } }),
}
