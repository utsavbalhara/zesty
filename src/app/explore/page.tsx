'use client'

import { useState, useEffect } from 'react'
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PostFeed } from '@/components/tweet/TweetFeed'
import { Avatar } from '@/components/ui/Avatar'
import { Search, Users, GraduationCap } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  username: string
  image?: string
  verified: boolean
  degree?: string
  branch?: string
  section?: number
  hostel?: string
  bio?: string
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [filterDegree, setFilterDegree] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [showUserFilters, setShowUserFilters] = useState(false)

  const fetchFilteredUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (filterDegree) params.append('degree', filterDegree)
      if (filterBranch) params.append('branch', filterBranch)
      
      const response = await fetch(`/api/users/filter?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestedUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching filtered users:', error)
    }
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header - Hidden on mobile (handled by MobileHeader) */}
        <div className="hidden md:block sticky top-0 glass backdrop-blur-2xl border-b border-glass-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search Zestyy"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass rounded-full border-glass-border"
            />
          </div>
        </div>

        {/* Trending Topics */}
        <div className="glass-card m-4 rounded-xl md:rounded-2xl p-4 md:p-6 border border-glass-border">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-light to-primary-blue bg-clip-text text-transparent">Trending for you</h2>
          <div className="space-y-3">
            {[
              { category: 'Trending in Technology', hashtag: '#NextJS', tweets: '125K' },
              { category: 'Trending in Programming', hashtag: '#TypeScript', tweets: '89K' },
              { category: 'Trending in Web Dev', hashtag: '#React', tweets: '234K' },
              { category: 'Trending in AI', hashtag: '#ChatGPT', tweets: '567K' },
            ].map((trend, index) => (
              <div key={index} className="hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 touch-target">
                <p className="text-sm text-muted-foreground">{trend.category}</p>
                <p className="font-bold text-foreground">{trend.hashtag}</p>
                <p className="text-sm text-muted-foreground">{trend.tweets} Posts</p>
              </div>
            ))}
          </div>
        </div>

        {/* Discover People */}
        <div className="glass-card m-4 rounded-xl md:rounded-2xl p-4 md:p-6 border border-glass-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center bg-gradient-to-r from-blue-light to-primary-blue bg-clip-text text-transparent">
              <Users className="h-5 w-5 mr-2 text-accent" />
              Discover People
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUserFilters(!showUserFilters)}
              className="hover:bg-accent/20 hover:text-accent rounded-xl touch-target"
            >
              <GraduationCap className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
          
          {showUserFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 glass rounded-xl border border-glass-border">
              <Input
                placeholder="Degree (e.g., B.Tech, M.Tech)"
                value={filterDegree}
                onChange={(e) => setFilterDegree(e.target.value)}
                className="glass rounded-xl border-glass-border"
              />
              <Input
                placeholder="Branch (e.g., CSE, ECE)"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="glass rounded-xl border-glass-border"
              />
              <Button 
                onClick={fetchFilteredUsers}
                variant="accent"
                className="touch-target"
              >
                Find Students
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterDegree('')
                  setFilterBranch('')
                  setSuggestedUsers([])
                }}
                className="hover:bg-accent/20 hover:text-accent rounded-xl touch-target"
              >
                Clear
              </Button>
            </div>
          )}

          {suggestedUsers.length > 0 && (
            <div className="space-y-3 mb-4">
              {suggestedUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all duration-300 touch-target">
                  <Link href={`/profile/${user.username}`} className="flex items-center space-x-3 flex-1">
                    <Avatar src={user.image} alt={user.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="font-semibold truncate text-foreground">{user.name}</p>
                        {user.verified && (
                          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-accent-info">
                            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.265-.177-.335-.538-.156-.804.178-.266.538-.336.804-.156l1.921 1.281 3.957-5.936c.178-.267.538-.336.804-.16.267.178.336.537.16.804z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      {(user.degree || user.branch) && (
                        <p className="text-xs text-accent-success">
                          {user.degree} {user.branch} {user.section && `- Section ${user.section}`}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Feed */}
        <PostFeed />
      </div>
    </ResponsiveLayout>
  )
}