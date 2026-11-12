import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-line bg-surface px-3 text-base text-ink',
        'placeholder:text-muted',
        'transition-all duration-300 ease-plant',
        'hover:border-primary/40',
        'focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:bg-primary-soft/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
