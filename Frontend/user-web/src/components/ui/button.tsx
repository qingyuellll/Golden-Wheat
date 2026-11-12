import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 ease-plant focus-visible:ring-2 focus-visible:ring-primary-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /* 统一按钮语言：白底 + 色边 + 色字，hover 转实底白字 */
        primary:
          'border border-primary bg-transparent text-primary hover:bg-primary hover:text-surface rounded-md',
        secondary:
          'border border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-surface rounded-md',
        outline:
          'border border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-surface rounded-md',
        ghost:
          'bg-transparent text-ink hover:bg-primary-soft hover:text-primary rounded-md',
        danger:
          'border border-danger bg-transparent text-danger hover:bg-danger hover:text-surface rounded-md',
        'danger-outline':
          'border border-danger bg-transparent text-danger hover:bg-danger hover:text-surface rounded-md',
        link:
          'bg-transparent text-primary underline-offset-4 hover:translate-x-1 hover:underline rounded-md',
        accent:
          'border border-accent bg-transparent text-primary-ink hover:bg-accent hover:text-primary-ink rounded-md',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
