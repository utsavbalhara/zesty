import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Additional props can be added here if needed
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl glass px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 ease-out',
          'border border-glass-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:ring-offset-0',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          'backdrop-blur-md hover:backdrop-blur-lg focus:backdrop-blur-lg',
          'shadow-lg hover:shadow-xl focus:shadow-2xl hover:shadow-accent/10 focus:shadow-accent/20',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }