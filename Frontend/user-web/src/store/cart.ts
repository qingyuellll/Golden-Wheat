import { create } from 'zustand'
import type { ShoppingCart } from '@/types/api'

interface CartState {
  items: ShoppingCart[]
  setItems: (items: ShoppingCart[]) => void
  totalCount: () => number
  totalAmount: () => number
  clear: () => void
}

export const useCartStore = create<CartState>()(
  (set, get) => ({
    items: [],
    setItems: (items) => set({ items }),
    totalCount: () => get().items.reduce((sum, i) => sum + i.number, 0),
    totalAmount: () => get().items.reduce((sum, i) => sum + i.amount * i.number, 0),
    clear: () => set({ items: [] }),
  }),
)
