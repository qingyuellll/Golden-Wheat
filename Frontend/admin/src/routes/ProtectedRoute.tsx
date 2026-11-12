import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

/** 路由守卫：未登录跳 /login */
export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}
