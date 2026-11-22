import { apiPostAbsolute } from '@/lib/request'
import { useAuthStore } from '@/store/auth'

export const chatApi = {
  /**
   * AI 客服走 /api/chat/**（JWT 同样要求登录），与业务接口的 /user 前缀不同，
   * 所以用绝对路径的请求方法，避免拼出 /user/api/chat/send。
   */
  send(message: string) {
    return apiPostAbsolute<string>('/api/chat/send', { message })
  },

  /**
   * SSE 流式对话（打字机效果）。
   *
   * 为什么不用 EventSource：后端 JWT 走 `authentication` 请求头，
   * EventSource 无法自定义请求头，令牌会被拦截器直接拒绝；
   * 因此用 fetch + ReadableStream 手工解析 SSE 帧，令牌与普通请求保持一致。
   *
   * @param message 用户输入
   * @param onToken 每收到一个增量分片回调一次（后端已完成 token 清洗）
   * @param signal  用于组件卸载时中断流，防止内存泄漏
   * @returns 完整回答文本
   */
  async stream(
    message: string,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const token = useAuthStore.getState().token
    const res = await fetch(
      `/api/chat/stream?message=${encodeURIComponent(message)}`,
      {
        headers: token ? { authentication: token } : undefined,
        signal,
      },
    )
    if (!res.ok) {
      throw new Error(res.status === 401 ? '登录已过期' : `SSE 连接失败（${res.status}）`)
    }

    const reader = res.body?.getReader()
    if (!reader) {
      throw new Error('当前浏览器不支持流式响应')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let full = ''

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE 帧以空行分隔；一个事件内多行 data: 按规范用 \n 连接还原原文
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''

      for (const frame of frames) {
        const dataLines = frame
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5))
        if (dataLines.length > 0) {
          const chunk = dataLines.join('\n')
          if (chunk) {
            full += chunk
            onToken(chunk)
          }
        }
      }
    }

    return full
  },
}
