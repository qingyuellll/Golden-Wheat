import { useState, useRef } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { commonApi } from '@/api/common'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片不能超过 5MB')
      return
    }
    setLoading(true)
    try {
      const url = await commonApi.upload(file)
      onChange(url)
    } catch {
      // interceptor handles
    } finally {
      setLoading(false)
    }
  }

  const remove = () => onChange('')

  return (
    <div className={cn('relative', className)}>
      {value ? (
        <div className="group relative h-24 w-24 overflow-hidden rounded-md border border-line">
          <img
            src={value}
            alt="preview"
            className="h-full w-full object-cover"
          />
          <button
            onClick={remove}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/50 text-surface opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <X size={12} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line bg-surface text-muted transition-colors duration-300 hover:border-primary hover:bg-primary-soft hover:text-primary disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={20} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <>
              <ImagePlus size={20} strokeWidth={1.5} />
              <span className="text-xs">上传</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
