'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Image, Smile, Calendar, MapPin } from 'lucide-react'

interface PostComposerProps {
  onPostCreated?: () => void
  placeholder?: string
}

export function PostComposer({ onPostCreated, placeholder = "What's fresh today?" }: PostComposerProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      if (response.ok) {
        setContent('')
        onPostCreated?.()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) return null

  const remainingChars = 280 - content.length
  const isOverLimit = remainingChars < 0
  const canPost = content.trim().length > 0 && !isOverLimit && !isLoading

  return (
    <div className="glass-card m-4 md:rounded-2xl rounded-xl p-4 md:p-6 border border-glass-border shadow-xl">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3 md:space-x-4">
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar src={session.user?.image} alt={session.user?.name || ''} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-success rounded-full border-2 border-primary-black animate-pulse" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] md:min-h-[140px] text-base md:text-lg border-0 resize-none focus:ring-0 p-0 placeholder:text-base md:placeholder:text-lg placeholder:text-muted-foreground/60 bg-transparent backdrop-blur-0"
              maxLength={300}
            />
            
            {/* Post options */}
            <div className="flex items-center justify-between pt-3 border-t border-glass-border">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button" 
                  className="text-accent hover:bg-accent/20 hover:text-blue-light md:hover:scale-110 transition-all duration-200 rounded-xl touch-target"
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button" 
                  className="text-accent hover:bg-accent/20 hover:text-blue-light md:hover:scale-110 transition-all duration-200 rounded-xl touch-target"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button" 
                  className="text-accent hover:bg-accent/20 hover:text-blue-light md:hover:scale-110 transition-all duration-200 rounded-xl touch-target"
                >
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button" 
                  className="text-accent hover:bg-accent/20 hover:text-blue-light md:hover:scale-110 transition-all duration-200 rounded-xl touch-target"
                >
                  <MapPin className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                {content.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-glass-border"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={remainingChars < 20 ? 'text-accent-error' : remainingChars < 50 ? 'text-accent-warning' : 'text-accent'}
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${((280 - remainingChars) / 280) * 100}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      {remainingChars < 50 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-bold ${isOverLimit ? 'text-accent-error' : remainingChars < 20 ? 'text-accent-warning' : 'text-muted-foreground'}`}>
                            {remainingChars}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={!canPost}
                  variant="accent"
                  size="default"
                  className="font-bold px-6 md:px-8 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-black/30 border-t-primary-black rounded-full animate-spin" />
                      <span>Posting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>✨</span>
                      <span>Post</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// Export as both names for backward compatibility
export const TweetComposer = PostComposer