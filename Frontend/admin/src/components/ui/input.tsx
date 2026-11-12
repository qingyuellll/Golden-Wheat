import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * 输入框原子：禁用系统聚焦蓝，浅绿聚焦环 + 浅绿底过渡
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-line bg-surface px-3 text-base text-ink',
        'placeholder:text-muted',
        'transition-colors duration-300 ease-plant',
        'hover:border-primary/40',
        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:bg-primary-soft/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
