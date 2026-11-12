import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-20 w-full rounded-md border border-line bg-surface px-3 py-2 text-base text-ink',
      'placeholder:text-muted',
      'transition-colors duration-300 ease-plant',
      'hover:border-primary/40',
      'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:bg-primary-soft/40',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'resize-none',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
