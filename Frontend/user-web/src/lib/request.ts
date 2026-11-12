import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios'
import { useAuthStore } from '@/store/auth'
import { toast } from '@/components/ui/toast'
import type { Result } from '@/types/api'

export const http: AxiosInstance = axios.create({
  baseURL: '/user',
  timeout: 15000,
  /**
   * 数组参数序列化为重复键（ids=1&ids=2）。
   * axios 默认输出 ids[]=1&ids[]=2，Spring 的 @RequestParam List<Long> ids 只认重复键，
   * 用括号键会直接 400，这里统一成后端能绑定的格式。
   */
  paramsSerializer: { indexes: null },
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers['authentication'] = token
  }
  return config
})

http.interceptors.response.use(
  (res: AxiosResponse) => {
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
  async (err: AxiosError) => {
    const status = err.response?.status
    if (status === 401) {
      //游客访问了需要登录的接口：没有令牌可刷新，直接引导登录，不提示"已过期"
      if (!useAuthStore.getState().token) {
        forceRelogin('请先登录')
        return Promise.reject(err)
      }
      //刷新接口本身 401：refresh token 也失效了，直接踢回登录
      if (err.config?.url === '/user/user/refresh') {
        forceRelogin()
        return Promise.reject(err)
      }
      //用 refresh token 换新 token 后重放原请求（并发 401 只发一次刷新）
      const newToken = await refreshTokens()
      if (newToken && err.config) {
        err.config.headers['authentication'] = newToken
        return http.request(err.config)
      }
      forceRelogin()
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

let refreshing: Promise<string | null> | null = null

/** 单飞刷新：多个并发 401 共享同一次刷新请求 */
function refreshTokens(): Promise<string | null> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null
    })
  }
  return refreshing
}

async function doRefresh(): Promise<string | null> {
  const refresh = useAuthStore.getState().refreshToken
  if (!refresh) return null
  try {
    const res = await axios.post<Result<{ token: string; refreshToken: string }>>(
      '/user/user/refresh',
      null,
      { headers: { authentication: refresh } },
    )
    const data = res.data?.data
    if (res.data?.code === 1 && data?.token && data?.refreshToken) {
      useAuthStore.getState().setTokens(data.token, data.refreshToken)
      return data.token
    }
    return null
  } catch {
    return null
  }
}

function forceRelogin(message = '登录已过期，请重新登录') {
  useAuthStore.getState().clear()
  toast.error(message)
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

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

/**
 * 不带 /user 前缀的接口（目前只有 /api/chat/**）。
 * 复用同一个实例，因此鉴权头与 401 刷新逻辑保持一致，只把 baseURL 显式清空。
 */
export async function apiPostAbsolute<T>(url: string, data?: unknown): Promise<T> {
  const res = await http.post<Result<T>>(url, data, { baseURL: '' })
  return res.data.data as T
}
