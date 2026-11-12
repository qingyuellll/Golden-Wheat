import { apiGet, apiPost, apiPut } from '@/lib/request'
import type {
  Employee,
  EmployeeDTO,
  EmployeeLoginDTO,
  EmployeeLoginVO,
  EmployeePageQuery,
  PageResult,
} from '@/types/api'

export const employeeApi = {
  login: (data: EmployeeLoginDTO) =>
    apiPost<EmployeeLoginVO>('/employee/login', data),
  logout: () => apiPost<void>('/employee/logout'),
  create: (data: EmployeeDTO) => apiPost<void>('/employee', data),
  page: (params: EmployeePageQuery) =>
    apiGet<PageResult<Employee>>('/employee/page', params),
  toggleStatus: (id: number, status: 0 | 1) =>
    apiPost<void>(`/employee/status/${status}`, undefined, { params: { id } }),
  detail: (id: number) => apiGet<Employee>(`/employee/${id}`),
  update: (data: EmployeeDTO) => apiPut<void>('/employee', data),
  editPassword: (oldPassword: string, newPassword: string) =>
    apiPut<void>('/employee/editPassword', { oldPassword, newPassword }),
}
