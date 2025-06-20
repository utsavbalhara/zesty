'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Home,
  Search,
  ShoppingBag,
  Bell,
  User,
} from 'lucide-react'

export function BottomTabBar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const tabs = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      name: 'Explore',
      href: '/explore',
      icon: Search,
      isActive: pathname === '/explore'
    },
    {
      name: 'Market',
      href: '/marketplace',
      icon: ShoppingBag,
      isActive: pathname === '/marketplace'
    },
    {
      name: 'Alerts',
      href: '/notifications',
      icon: Bell,
      isActive: pathname === '/notifications'
    },
    {
      name: 'Profile',
      href: `/profile/${session?.user?.username || session?.user?.email?.split('@')[0]}`,
      icon: User,
      isActive: pathname.startsWith('/profile')
    },
  ]

  return (
    <nav className="glass-nav backdrop-blur-2xl border-t border-glass-border fixed bottom-0 left-0 right-0 z-50 pointer-events-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-2 min-h-[60px]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-2 py-1.5 rounded-xl min-w-[56px] min-h-[48px] transition-all duration-300 relative pointer-events-auto',
                tab.isActive
                  ? 'text-accent bg-accent/20'
                  : 'text-muted-foreground hover:text-accent hover:bg-accent/10 active:bg-accent/20'
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  'h-6 w-6 transition-all duration-300',
                  tab.isActive && 'drop-shadow-sm'
                )} />
                {tab.isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                )}
              </div>
              <span className={cn(
                'text-xs font-medium transition-all duration-300',
                tab.isActive ? 'text-accent' : 'text-muted-foreground'
              )}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}