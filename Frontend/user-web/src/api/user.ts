import { apiPost } from '@/lib/request'
import type { UserLoginVO } from '@/types/api'

/**
 * 登录相关接口的控制器根路径是 /user/user（模块前缀 /user + 控制器 /user），
 * 实例的 baseURL 已经是 /user，因此这里的路径要写成 /user/**，最终请求 /user/user/**。
 */
export const userApi = {
  sendCode(phone: string) {
    return apiPost<string>('/user/sendCode', { phone })
  },

  webLogin(data: { phone: string; code: string }) {
    return apiPost<UserLoginVO>('/user/webLogin', data)
  },

  login(data: { code: string }) {
    return apiPost<UserLoginVO>('/user/login', data)
  },
}
