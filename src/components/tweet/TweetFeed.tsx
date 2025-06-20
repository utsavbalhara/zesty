'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './TweetCard'

interface Post {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    verified: boolean
  }
  likes: { userId: string }[]
  reposts: { userId: string; createdAt: string }[]
  comments: { id: string }[]
  _count: {
    likes: number
    reposts: number
    comments: number
  }
}

interface PostFeedProps {
  refreshTrigger?: number
}

export function PostFeed({ refreshTrigger }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setError(null)
      const response = await fetch('/api/posts')
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [refreshTrigger])

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-glass-border border-t-accent"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 border-4 border-accent/20"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading fresh posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 border border-red-500/30">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-foreground font-medium">{error}</p>
            <button 
              onClick={fetchPosts}
              className="mt-3 glass-button px-6 py-2 rounded-xl text-accent hover:text-accent-yellow transition-colors duration-200"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-accent/20 to-accent-yellow/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Welcome to Zestyy! ✨</h3>
            <p className="text-muted-foreground">No posts yet. Be the first to share something fresh with the community!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpdate={fetchPosts}
        />
      ))}
    </div>
  )
}

// Export as both names for backward compatibility
export const TweetFeed = PostFeed