import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/login'
import { DashboardPage } from '@/pages/dashboard'
import { EmployeePage } from '@/pages/employee/list'
import { DishPage } from '@/pages/dish/list'
import { OrderPage } from '@/pages/order/list'
import { CategoryPage } from '@/pages/category'
import { SetmealPage } from '@/pages/setmeal'
import { CouponPage } from '@/pages/coupon'
import { ShopPage } from '@/pages/shop'
import { ReportPage } from '@/pages/report'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/employee', element: <EmployeePage /> },
          { path: '/dish', element: <DishPage /> },
          { path: '/order', element: <OrderPage /> },
          { path: '/category', element: <CategoryPage /> },
          { path: '/setmeal', element: <SetmealPage /> },
          { path: '/coupon', element: <CouponPage /> },
          { path: '/shop', element: <ShopPage /> },
          { path: '/report', element: <ReportPage /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
])
