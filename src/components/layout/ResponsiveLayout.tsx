'use client'

import { ReactNode, useEffect, useState } from 'react'
import { MainLayout } from './MainLayout'
import { MobileLayout } from './MobileLayout'

interface ResponsiveLayoutProps {
  children: ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIsMobile()

    // Listen for resize events
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-glass-border border-t-accent"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 border-4 border-accent/20"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading Zestyy...</p>
        </div>
      </div>
    )
  }

  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <MainLayout>{children}</MainLayout>
  )
}