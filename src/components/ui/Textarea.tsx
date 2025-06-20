import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Additional props can be added here if needed
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-xl glass px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 ease-out resize-none',
          'border border-glass-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:ring-offset-0',
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
Textarea.displayName = 'Textarea'

export { Textarea }