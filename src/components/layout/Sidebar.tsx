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
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  // Generate navigation with dynamic profile link
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Explore', href: '/explore', icon: Search },
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
    <div className="flex h-screen w-64 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </div>
          <span className="text-xl font-bold">Twitter</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-full px-3 py-3 text-lg font-medium transition-colors hover:bg-muted',
                isActive ? 'font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Tweet Button */}
      <div className="px-3 py-4">
        <Button className="w-full text-lg font-bold py-3">
          Tweet
        </Button>
      </div>

      {/* User Menu */}
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between rounded-full p-3 hover:bg-muted transition-colors">
          <Link 
            href={`/profile/${session.user?.username || session.user?.email?.split('@')[0]}`}
            className="flex items-center space-x-3 flex-1 min-w-0"
          >
            <Avatar src={session.user?.image} alt={session.user?.name || ''} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user?.name}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                @{session.user?.username || session.user?.email?.split('@')[0]}
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}