import { apiGet, apiBlob } from '@/lib/request'
import type {
  OrderReport,
  SalesTop10Report,
  TurnoverReport,
  UserReport,
} from '@/types/api'

function splitCsv(csv: string | null | undefined): string[] {
  if (!csv) return []
  return csv.split(',').map((s) => s.trim()).filter(Boolean)
}

/** 销量排行条目：后端 /report/top10 已按下单量合并菜品与套餐，名字即展示名 */
export interface SalesRankItem {
  name: string
  number: number
}

export const reportApi = {
  turnover: (begin: string, end: string) =>
    apiGet<TurnoverReport>('/report/turnoverStatistics', { begin, end }),
  user: (begin: string, end: string) =>
    apiGet<UserReport>('/report/userStatistics', { begin, end }),
  orders: (begin: string, end: string) =>
    apiGet<OrderReport>('/report/ordersStatistics', { begin, end }),
  export: () => apiBlob('/report/export'),

  /**
   * 销量排行：后端返回的是 nameList / numberList 两串逗号分隔文本，
   * 这里一次性拼成页面可直接渲染的数组
   */
  top10: async (begin: string, end: string): Promise<SalesRankItem[]> => {
    const res = await apiGet<SalesTop10Report>('/report/top10', { begin, end })
    const names = splitCsv(res.nameList)
    const numbers = splitCsv(res.numberList).map(Number)
    return names.map((name, i) => ({ name, number: numbers[i] ?? 0 }))
  },

  orderReport: async (begin: string, end: string) => {
    const [orderRes, turnoverRes] = await Promise.all([
      apiGet<OrderReport>('/report/ordersStatistics', { begin, end }),
      apiGet<TurnoverReport>('/report/turnoverStatistics', { begin, end }),
    ])
    return {
      dateList: splitCsv(orderRes.dateList),
      orderCountList: splitCsv(orderRes.orderCountList).map(Number),
      turnoverList: splitCsv(turnoverRes.turnoverList).map(Number),
    }
  },
}
