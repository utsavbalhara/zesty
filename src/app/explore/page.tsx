'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Input } from '@/components/ui/Input'
import { TweetFeed } from '@/components/tweet/TweetFeed'
import { Search } from 'lucide-react'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search Twitter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-0 rounded-full"
            />
          </div>
        </div>

        {/* Trending Topics */}
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold mb-4">Trending for you</h2>
          <div className="space-y-3">
            {[
              { category: 'Trending in Technology', hashtag: '#NextJS', tweets: '125K' },
              { category: 'Trending in Programming', hashtag: '#TypeScript', tweets: '89K' },
              { category: 'Trending in Web Dev', hashtag: '#React', tweets: '234K' },
              { category: 'Trending in AI', hashtag: '#ChatGPT', tweets: '567K' },
            ].map((trend, index) => (
              <div key={index} className="hover:bg-muted/50 p-3 rounded-lg cursor-pointer transition-colors">
                <p className="text-sm text-muted-foreground">{trend.category}</p>
                <p className="font-bold">{trend.hashtag}</p>
                <p className="text-sm text-muted-foreground">{trend.tweets} Tweets</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tweet Feed */}
        <TweetFeed />
      </div>
    </MainLayout>
  )
}