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
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>{error}</p>
        <button 
          onClick={fetchPosts}
          className="mt-2 text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No posts yet. Be the first to post!</p>
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