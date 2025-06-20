import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'glass' | 'accent'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary-black disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
          {
            // Glass primary button with blue theme
            'glass-button text-white font-semibold shadow-lg hover:shadow-2xl active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-light/20 before:to-primary-blue/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300': variant === 'default',
            
            // Glass outline button
            'glass border-2 border-accent/50 text-accent hover:bg-accent/10 hover:border-blue-light hover:shadow-lg hover:shadow-accent/25 active:scale-95': variant === 'outline',
            
            // Glass ghost button for subtle interactions
            'text-muted-foreground hover:bg-glass-bg hover:text-foreground hover:backdrop-blur-sm rounded-xl active:scale-95': variant === 'ghost',
            
            // Destructive glass button
            'glass border border-red-500/50 bg-red-500/20 text-red-100 hover:bg-red-500/30 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/25 active:scale-95': variant === 'destructive',
            
            // Pure glass effect
            'glass text-white hover:bg-white/20 active:scale-95': variant === 'glass',
            
            // Accent button with blue gradient
            'bg-gradient-to-r from-primary-blue to-blue-light text-white font-bold hover:from-primary-blue/90 hover:to-blue-light/90 hover:shadow-lg hover:shadow-primary-blue/30 active:scale-95': variant === 'accent',
          },
          {
            'h-12 px-6 py-3 text-sm': size === 'default',
            'h-10 px-4 py-2 text-sm rounded-xl': size === 'sm',
            'h-14 px-8 py-4 text-base': size === 'lg',
            'h-12 w-12 rounded-xl': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }