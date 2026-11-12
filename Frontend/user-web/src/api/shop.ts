import { apiGet } from '@/lib/request'
import type { ShopConfig } from '@/types/api'

export const shopApi = {
  getStatus: () => apiGet<number>('/shop/status'),
  /** 下单页需要营业状态与打包费，与后端实收金额同源 */
  getConfig: () => apiGet<ShopConfig>('/shop/config'),
}
