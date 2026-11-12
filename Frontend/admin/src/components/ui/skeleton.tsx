import * as React from 'react'
import { cn } from '@/lib/utils'

/** 骨架屏：弱化脉动，避免重色彩 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-primary-soft/50', className)}
      {...props}
    />
  )
}

export { Skeleton }
