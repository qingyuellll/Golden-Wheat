import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/request'
import type { AddressBook } from '@/types/api'

export const addressApi = {
  list: () => apiGet<AddressBook[]>('/addressBook/list'),
  getById: (id: number) => apiGet<AddressBook>(`/addressBook/${id}`),
  create: (data: Omit<AddressBook, 'id' | 'createTime' | 'updateTime'>) =>
    apiPost<void>('/addressBook', data),
  update: (data: AddressBook) => apiPut<void>('/addressBook', data),
  setDefault: (id: number) => apiPut<void>('/addressBook/default', { id }),
  delete: (id: number) => apiDelete<void>('/addressBook', { id }),
  getDefault: () => apiGet<AddressBook>('/addressBook/default'),
}
