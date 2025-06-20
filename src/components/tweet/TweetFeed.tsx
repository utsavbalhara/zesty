'use client'

import { useState, useEffect } from 'react'
import { TweetCard } from './TweetCard'

interface Tweet {
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
  retweets: { userId: string; createdAt: string }[]
  comments: { id: string }[]
  _count: {
    likes: number
    retweets: number
    comments: number
  }
}

interface TweetFeedProps {
  refreshTrigger?: number
}

export function TweetFeed({ refreshTrigger }: TweetFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTweets = async () => {
    try {
      setError(null)
      const response = await fetch('/api/tweets')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tweets')
      }

      const data = await response.json()
      setTweets(data.tweets || [])
    } catch (error) {
      console.error('Error fetching tweets:', error)
      setError('Failed to load tweets')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()
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
          onClick={fetchTweets}
          className="mt-2 text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (tweets.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No tweets yet. Be the first to tweet!</p>
      </div>
    )
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          onUpdate={fetchTweets}
        />
      ))}
    </div>
  )
}