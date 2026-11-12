import { apiPostAbsolute } from '@/lib/request'

export const chatApi = {
  /**
   * AI 客服走 /api/chat/**（JWT 同样要求登录），与业务接口的 /user 前缀不同，
   * 所以用绝对路径的请求方法，避免拼出 /user/api/chat/send。
   */
  send(message: string) {
    return apiPostAbsolute<string>('/api/chat/send', { message })
  },
}
