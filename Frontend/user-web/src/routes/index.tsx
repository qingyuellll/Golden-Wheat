import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })))
const MenuPage = lazy(() => import('@/pages/menu').then((m) => ({ default: m.MenuPage })))
const DishDetailPage = lazy(() => import('@/pages/dish-detail').then((m) => ({ default: m.DishDetailPage })))
const SetmealDetailPage = lazy(() => import('@/pages/setmeal-detail').then((m) => ({ default: m.SetmealDetailPage })))
const CartPage = lazy(() => import('@/pages/cart').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/checkout').then((m) => ({ default: m.CheckoutPage })))
const OrdersPage = lazy(() => import('@/pages/orders').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('@/pages/order-detail').then((m) => ({ default: m.OrderDetailPage })))
const AddressPage = lazy(() => import('@/pages/address').then((m) => ({ default: m.AddressPage })))
const CouponsPage = lazy(() => import('@/pages/coupons').then((m) => ({ default: m.CouponsPage })))
const ChatPage = lazy(() => import('@/pages/chat').then((m) => ({ default: m.ChatPage })))
const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })))

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <SuspenseWrap><HomePage /></SuspenseWrap> },
      { path: 'menu', element: <SuspenseWrap><MenuPage /></SuspenseWrap> },
      { path: 'dish/:id', element: <SuspenseWrap><DishDetailPage /></SuspenseWrap> },
      { path: 'setmeal/:id', element: <SuspenseWrap><SetmealDetailPage /></SuspenseWrap> },
      { path: 'cart', element: <SuspenseWrap><ProtectedRoute><CartPage /></ProtectedRoute></SuspenseWrap> },
      { path: 'checkout', element: <SuspenseWrap><ProtectedRoute><CheckoutPage /></ProtectedRoute></SuspenseWrap> },
      { path: 'orders', element: <SuspenseWrap><ProtectedRoute><OrdersPage /></ProtectedRoute></SuspenseWrap> },
      { path: 'order/:id', element: <SuspenseWrap><ProtectedRoute><OrderDetailPage /></ProtectedRoute></SuspenseWrap> },
      { path: 'address', element: <SuspenseWrap><ProtectedRoute><AddressPage /></ProtectedRoute></SuspenseWrap> },
      { path: 'coupons', element: <SuspenseWrap><CouponsPage /></SuspenseWrap> },
      { path: 'chat', element: <SuspenseWrap><ChatPage /></SuspenseWrap> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <SuspenseWrap><LoginPage /></SuspenseWrap> },
    ],
  },
])
