'use client'

import { useSession } from 'next-auth/react'
import { Sidebar } from './Sidebar'
import { RightSidebar } from './RightSidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!session) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 border-r border-border">
        {children}
      </main>
      <RightSidebar />
    </div>
  )
}