import { apiPost, apiBlob } from '@/lib/request'

export const commonApi = {
  /** 上传图片到 OSS，返回可访问 URL */
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiPost<string>('/common/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  /** 下载文件（按文件名） */
  download: (fileName: string) =>
    apiBlob('/common/download', { fileName }),
}
