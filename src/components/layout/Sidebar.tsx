'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  LogOut,
  ShoppingBag,
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  // Generate navigation with dynamic profile link
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Messages', href: '/messages', icon: Mail },
    { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
    { 
      name: 'Profile', 
      href: `/profile/${session.user?.username || session.user?.email?.split('@')[0]}`, 
      icon: User 
    },
    { name: 'More', href: '/more', icon: MoreHorizontal },
  ]

  return (
    <div className="flex h-screen w-72 flex-col glass-nav backdrop-blur-2xl">
      {/* Logo */}
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-blue to-blue-light flex items-center justify-center shadow-lg">
            <svg className="h-6 w-6 text-white font-bold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-blue to-blue-light bg-clip-text text-transparent">
            Zestyy
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center space-x-4 rounded-2xl px-4 py-4 text-base font-medium transition-all duration-300 ease-out relative overflow-hidden',
                isActive 
                  ? 'glass-button text-white font-semibold shadow-lg transform translate-x-1' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-glass-bg hover:backdrop-blur-sm hover:translate-x-1 hover:shadow-md'
              )}
            >
              <item.icon className={cn(
                'h-6 w-6 transition-all duration-300',
                isActive ? 'text-blue-light' : 'group-hover:text-accent'
              )} />
              <span className="transition-all duration-300">{item.name}</span>
              {isActive && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-light animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Post Button */}
      <div className="px-4 py-6">
        <Button variant="accent" size="lg" className="w-full text-base font-bold">
          <span className="mr-2">✨</span>
          Post
        </Button>
      </div>

      {/* User Menu */}
      <div className="p-4">
        <div className="glass-card rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <Link 
              href={`/profile/${session.user?.username || session.user?.email?.split('@')[0]}`}
              className="flex items-center space-x-3 flex-1 min-w-0 group-hover:scale-105 transition-transform duration-300"
            >
              <div className="relative">
                <Avatar src={session.user?.image} alt={session.user?.name || ''} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-success rounded-full border-2 border-primary-black animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">
                  {session.user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{session.user?.username || session.user?.email?.split('@')[0]}
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="h-10 w-10 hover:bg-red-500/20 hover:text-red-400 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}