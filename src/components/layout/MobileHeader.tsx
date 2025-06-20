'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Search, MessageCircle, Bell } from 'lucide-react'

export function MobileHeader() {
  const { data: session } = useSession()

  return (
    <header className="glass-nav backdrop-blur-2xl border-b border-glass-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 min-h-[60px]">
        {/* Left - Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-blue to-blue-light flex items-center justify-center shadow-lg">
            <svg className="h-5 w-5 text-white font-bold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-blue to-blue-light bg-clip-text text-transparent">
            Zestyy
          </span>
        </Link>

        {/* Right - Actions */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl text-muted-foreground hover:text-accent hover:bg-accent/20"
            asChild
          >
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl text-muted-foreground hover:text-accent hover:bg-accent/20"
            asChild
          >
            <Link href="/messages">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>

          {/* User Avatar */}
          <Link 
            href={`/profile/${session?.user?.username || session?.user?.email?.split('@')[0]}`}
            className="ml-2"
          >
            <div className="relative">
              <Avatar 
                src={session?.user?.image} 
                alt={session?.user?.name || ''} 
                className="h-9 w-9 ring-2 ring-transparent hover:ring-accent/50 transition-all duration-300"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-success rounded-full border-2 border-primary-black" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}