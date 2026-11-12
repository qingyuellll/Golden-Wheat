import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * 标签原子：弱化底色 + 文字色，拒绝刺眼纯色
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary-soft text-primary',
        secondary: 'bg-secondary-soft text-secondary-ink',
        accent: 'bg-accent-soft text-primary-ink',
        muted: 'bg-primary-soft/40 text-muted',
        danger: 'bg-danger-soft text-danger',
        success: 'bg-primary-soft text-primary',
        warn: 'bg-accent-soft text-primary-ink',
        outline: 'border border-line text-muted',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
