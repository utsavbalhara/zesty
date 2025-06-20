'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Image, Smile, Calendar, MapPin } from 'lucide-react'

interface TweetComposerProps {
  onTweetCreated?: () => void
  placeholder?: string
}

export function TweetComposer({ onTweetCreated, placeholder = "What's happening?" }: TweetComposerProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/tweets', {
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
        onTweetCreated?.()
      }
    } catch (error) {
      console.error('Error creating tweet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) return null

  const remainingChars = 280 - content.length
  const isOverLimit = remainingChars < 0
  const canTweet = content.trim().length > 0 && !isOverLimit && !isLoading

  return (
    <div className="border-b border-border p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <Avatar src={session.user?.image} alt={session.user?.name || ''} />
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] text-xl border-0 resize-none focus:ring-0 p-0 placeholder:text-xl"
              maxLength={300}
            />
            
            {/* Tweet options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" type="button" className="text-accent hover:bg-accent/10">
                  <Image className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" type="button" className="text-accent hover:bg-accent/10">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" type="button" className="text-accent hover:bg-accent/10">
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" type="button" className="text-accent hover:bg-accent/10">
                  <MapPin className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                {content.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-muted"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={remainingChars < 20 ? 'text-destructive' : 'text-accent'}
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${((280 - remainingChars) / 280) * 100}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                    {remainingChars < 20 && (
                      <span className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {remainingChars}
                      </span>
                    )}
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={!canTweet}
                  className="font-bold"
                >
                  {isLoading ? 'Tweeting...' : 'Tweet'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}