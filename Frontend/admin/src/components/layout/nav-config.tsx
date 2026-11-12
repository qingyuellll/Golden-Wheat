import {
  LayoutDashboard,
  Users,
  FolderTree,
  UtensilsCrossed,
  Package,
  ReceiptText,
  Ticket,
  BarChart3,
  Store,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** 模块是否已实现（false → 渲染为占位） */
  ready: boolean
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: '经营总览',
    items: [
      { to: '/dashboard', label: '工作台', icon: LayoutDashboard, ready: true },
      { to: '/report', label: '数据报表', icon: BarChart3, ready: true },
    ],
  },
  {
    title: '商品管理',
    items: [
      { to: '/category', label: '分类管理', icon: FolderTree, ready: true },
      { to: '/dish', label: '菜品管理', icon: UtensilsCrossed, ready: true },
      { to: '/setmeal', label: '套餐管理', icon: Package, ready: true },
    ],
  },
  {
    title: '交易管理',
    items: [
      { to: '/order', label: '订单管理', icon: ReceiptText, ready: true },
      { to: '/coupon', label: '优惠券', icon: Ticket, ready: true },
    ],
  },
  {
    title: '系统',
    items: [
      { to: '/employee', label: '员工管理', icon: Users, ready: true },
      { to: '/shop', label: '商铺设置', icon: Store, ready: true },
    ],
  },
]
