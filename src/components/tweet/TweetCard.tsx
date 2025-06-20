'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatTimeAgo, formatNumber, cn } from '@/lib/utils'
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
} from 'lucide-react'

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
  likes?: { userId: string }[]
  retweets?: { userId: string; createdAt: string }[]
  comments?: { id: string }[]
  _count: {
    likes: number
    retweets: number
    comments: number
  }
}

interface PostCardProps {
  post: Post
  onUpdate?: () => void
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { data: session } = useSession()
  const [isLiking, setIsLiking] = useState(false)
  const [isRetweeting, setIsRetweeting] = useState(false)
  
  const isLiked = session?.user?.id ? post.likes?.some(like => like.userId === session.user.id) : false
  const isRetweeted = session?.user?.id ? post.retweets?.some(retweet => retweet.userId === session.user.id) : false

  const handleLike = async () => {
    if (!session?.user?.id || isLiking) return

    setIsLiking(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        onUpdate?.()
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleRetweet = async () => {
    if (!session?.user?.id || isRetweeting) return

    setIsRetweeting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/repost`, {
        method: 'POST',
      })

      if (response.ok) {
        onUpdate?.()
      }
    } catch (error) {
      console.error('Error toggling retweet:', error)
    } finally {
      setIsRetweeting(false)
    }
  }

  return (
    <article className="glass-card m-4 md:rounded-2xl rounded-xl p-4 md:p-6 hover:bg-white/15 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-accent/20 md:hover:scale-[1.02] group">
      <div className="flex space-x-3 md:space-x-4">
        <Link href={`/profile/${post.author.username || post.author.id}`} className="flex-shrink-0">
          <div className="relative group-hover:scale-110 transition-transform duration-300">
            <Avatar src={post.author.image} alt={post.author.name || ''} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 to-accent-yellow/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-3">
            <Link 
              href={`/profile/${post.author.username || post.author.id}`}
              className="font-bold text-foreground hover:text-accent transition-colors duration-200"
            >
              {post.author.name}
            </Link>
            {post.author.verified && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-info">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.265-.177-.335-.538-.156-.804.178-.266.538-.336.804-.156l1.921 1.281 3.957-5.936c.178-.267.538-.336.804-.16.267.178.336.537.16.804z"/>
                </svg>
              </div>
            )}
            <span className="text-muted-foreground text-sm">
              @{post.author.username || post.author.id}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <Link 
              href={`/tweet/${post.id}`}
              className="text-muted-foreground text-sm hover:text-accent transition-colors duration-200"
            >
              {formatTimeAgo(new Date(post.createdAt || new Date().toISOString()))}
            </Link>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/20">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-glass-border shadow-lg">
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="w-full h-auto transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between max-w-lg">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-accent hover:bg-accent/20 md:hover:scale-110 transition-all duration-200 rounded-xl touch-target"
            >
              <MessageCircle className="h-5 w-5 md:mr-2" />
              {post._count.comments > 0 && (
                <span className="text-sm font-medium ml-1 md:ml-0">{formatNumber(post._count.comments)}</span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetweet}
              disabled={isRetweeting}
              className={cn(
                "text-muted-foreground hover:text-accent-success hover:bg-accent-success/20 md:hover:scale-110 transition-all duration-200 rounded-xl touch-target",
                isRetweeted && "text-accent-success bg-accent-success/20"
              )}
            >
              <Repeat2 className={cn("h-5 w-5 md:mr-2", isRetweeted && "animate-pulse")} />
              {post._count.retweets > 0 && (
                <span className="text-sm font-medium ml-1 md:ml-0">{formatNumber(post._count.retweets)}</span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "text-muted-foreground hover:text-accent-error hover:bg-accent-error/20 md:hover:scale-110 transition-all duration-200 rounded-xl touch-target",
                isLiked && "text-accent-error bg-accent-error/20"
              )}
            >
              <Heart className={cn("h-5 w-5 md:mr-2", isLiked && "fill-current animate-pulse")} />
              {post._count.likes > 0 && (
                <span className="text-sm font-medium ml-1 md:ml-0">{formatNumber(post._count.likes)}</span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-accent-info hover:bg-accent-info/20 md:hover:scale-110 transition-all duration-200 rounded-xl touch-target"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}