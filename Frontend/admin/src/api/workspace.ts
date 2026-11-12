import { apiGet } from '@/lib/request'
import type {
  BusinessData,
  DishOverView,
  OrderOverView,
  SetmealOverView,
} from '@/types/api'

export const workspaceApi = {
  businessData: () => apiGet<BusinessData>('/workspace/businessData'),
  overviewOrders: () => apiGet<OrderOverView>('/workspace/overviewOrders'),
  overviewDishes: () => apiGet<DishOverView>('/workspace/overviewDishes'),
  overviewSetmeals: () => apiGet<SetmealOverView>('/workspace/overviewSetmeals'),
}
