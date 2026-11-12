import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
