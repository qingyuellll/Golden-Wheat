import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EmployeeInfo {
  id: number
  userName: string
  name: string
}

interface AuthState {
  token: string | null
  employee: EmployeeInfo | null
  setLogin: (payload: { token: string } & EmployeeInfo) => void
  clear: () => void
  isAuthenticated: () => boolean
}

/**
 * 鉴权 store：token + 当前员工信息
 * 持久化到 localStorage（key: gw-admin-auth），刷新不掉登录
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      employee: null,
      setLogin: ({ token, id, userName, name }) =>
        set({ token, employee: { id, userName, name } }),
      clear: () => set({ token: null, employee: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'gw-admin-auth',
      partialize: (state) => ({
        token: state.token,
        employee: state.employee,
      }),
    },
  ),
)
