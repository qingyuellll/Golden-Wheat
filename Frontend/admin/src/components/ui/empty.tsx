import * as React from 'react'
import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
  action?: React.ReactNode
}

/** 空状态：植物意象图标，弱化文字 */
export function Empty({
  title = '暂无数据',
  description,
  icon,
  className,
  action,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-soft text-secondary-ink">
        {icon ?? <Leaf size={20} strokeWidth={1.5} />}
      </div>
      <p className="text-base text-ink">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action}
    </div>
  )
}
