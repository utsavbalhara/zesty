'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Search } from 'lucide-react'

const trends = [
  { category: 'Trending in Technology', hashtag: '#NextJS', tweets: '125K' },
  { category: 'Trending in Programming', hashtag: '#TypeScript', tweets: '89K' },
  { category: 'Trending in Web Dev', hashtag: '#React', tweets: '234K' },
  { category: 'Trending in AI', hashtag: '#ChatGPT', tweets: '567K' },
  { category: 'Trending in Tech', hashtag: '#JavaScript', tweets: '345K' },
]

const whoToFollow = [
  {
    id: '1',
    name: 'Vercel',
    username: 'vercel',
    image: null,
    verified: true,
  },
  {
    id: '2',
    name: 'Next.js',
    username: 'nextjs',
    image: null,
    verified: true,
  },
  {
    id: '3',
    name: 'React',
    username: 'reactjs',
    image: null,
    verified: true,
  },
]

export function RightSidebar() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="w-80 p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search Twitter"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted border-0 rounded-full"
        />
      </div>

      {/* What's happening */}
      <div className="bg-muted rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-3">What's happening</h2>
        <div className="space-y-3">
          {trends.map((trend, index) => (
            <div key={index} className="hover:bg-background/50 p-2 rounded-lg cursor-pointer transition-colors">
              <p className="text-sm text-muted-foreground">{trend.category}</p>
              <p className="font-bold">{trend.hashtag}</p>
              <p className="text-sm text-muted-foreground">{trend.tweets} Tweets</p>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="mt-3 text-accent hover:text-accent">
          Show more
        </Button>
      </div>

      {/* Who to follow */}
      <div className="bg-muted rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-3">Who to follow</h2>
        <div className="space-y-3">
          {whoToFollow.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar src={user.image} alt={user.name} />
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="font-bold">{user.name}</p>
                    {user.verified && (
                      <svg className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.265-.177-.335-.538-.156-.804.178-.266.538-.336.804-.156l1.921 1.281 3.957-5.936c.178-.267.538-.336.804-.16.267.178.336.537.16.804z"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Follow
              </Button>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="mt-3 text-accent hover:text-accent">
          Show more
        </Button>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex flex-wrap gap-3">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="#" className="hover:underline">Accessibility</a>
          <a href="#" className="hover:underline">Ads info</a>
          <a href="#" className="hover:underline">More</a>
        </div>
        <p>© 2024 Twitter Clone, Inc.</p>
      </div>
    </div>
  )
}