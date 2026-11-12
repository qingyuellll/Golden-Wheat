import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios'
import { useAuthStore } from '@/store/auth'
import { toast } from '@/components/ui/toast'
import type { Result } from '@/types/api'

/**
 * 后端基地址：dev 走 Vite 代理 /admin → :8080，生产由部署侧处理
 */
export const http: AxiosInstance = axios.create({
  baseURL: '/admin',
  timeout: 15000,
  /**
   * 数组参数序列化为重复键（ids=1&ids=2）。
   * axios 默认输出 ids[]=1&ids[]=2，Spring 的 @RequestParam List<Long> ids 只认重复键，
   * 用括号键批量删除会直接 400，这里统一成后端能绑定的格式。
   */
  paramsSerializer: { indexes: null },
})

/** 请求拦截：注入管理端 JWT（请求头名固定为 token） */
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers['token'] = token
  }
  return config
})

/** 响应拦截：业务 code 校验 + 401 自动登出 */
http.interceptors.response.use(
  (res: AxiosResponse) => {
    // blob 流（文件下载 / 报表导出）不走 Result 解包
    if (res.config.responseType === 'blob') {
      return res
    }
    const body = res.data as Result<unknown>
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 1) return res
      toast.error(body.msg || '操作失败')
      return Promise.reject(new Error(body.msg || '操作失败'))
    }
    return res
  },
  (err: AxiosError) => {
    const status = err.response?.status
    if (status === 401) {
      useAuthStore.getState().clear()
      toast.error('登录已过期，请重新登录')
      // 软跳转，避免与路由库硬耦合
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (err.code === 'ECONNABORTED') {
      toast.error('请求超时，请稍后重试')
    } else if (!err.response) {
      toast.error('网络异常，请检查连接')
    } else {
      toast.error(err.message || '请求失败')
    }
    return Promise.reject(err)
  },
)

/* ===== 类型安全的语义化封装（自动解包 Result.data） =====
   params 用 object 约束，兼容无索引签名的 interface */
export async function apiGet<T>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await http.get<Result<T>>(url, {
    params: params as Record<string, unknown> | undefined,
    ...config,
  })
  return res.data.data as T
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await http.post<Result<T>>(url, data, config)
  return res.data.data as T
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await http.put<Result<T>>(url, data, config)
  return res.data.data as T
}

export async function apiDelete<T>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await http.delete<Result<T>>(url, {
    params: params as Record<string, unknown> | undefined,
    ...config,
  })
  return res.data.data as T
}

/** blob 下载：返回 Blob + 文件名（供 a 标签触发下载） */
export async function apiBlob(
  url: string,
  params?: object,
): Promise<{ blob: Blob; filename: string }> {
  const res = await http.get<Blob>(url, {
    params: params as Record<string, unknown> | undefined,
    responseType: 'blob',
  })
  // 解析 Content-Disposition 中的 filename
  const cd = res.headers['content-disposition'] as string | undefined
  let filename = 'download'
  if (cd) {
    const match = cd.match(/filename\*?=(?:UTF-8'')?([^;]+)/i)
    if (match) filename = decodeURIComponent(match[1].replace(/["']/g, ''))
  }
  return { blob: res.data, filename }
}
