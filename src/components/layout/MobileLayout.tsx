'use client'

import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { MobileHeader } from './MobileHeader'
import { BottomTabBar } from './BottomTabBar'
import { FloatingActionButton } from './FloatingActionButton'

interface MobileLayoutProps {
  children: ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { data: session } = useSession()

  if (!session) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col h-screen bg-primary-black">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: `calc(60px + env(safe-area-inset-bottom))` }}>
        {children}
      </main>
      
      {/* Bottom Tab Navigation */}
      <BottomTabBar />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  )
}