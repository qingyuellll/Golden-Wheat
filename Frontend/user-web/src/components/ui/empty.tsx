import { PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface EmptyProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function Empty({
  title = '暂无数据',
  description,
  icon,
  action,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 py-16 text-center',
        className,
      )}
    >
      {icon || (
        <PackageOpen
          size={40}
          strokeWidth={1.5}
          className="text-muted/40"
        />
      )}
      <p className="text-sm text-muted">{title}</p>
      {description && (
        <p className="text-xs text-muted/60">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
