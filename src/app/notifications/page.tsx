'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar } from '@/components/ui/Avatar'
import { formatTimeAgo } from '@/lib/utils'
import { Heart, Repeat2, UserPlus, MessageCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'like' | 'retweet' | 'follow' | 'comment'
  user: {
    id: string
    name: string
    username: string
    image: string | null
  }
  content: string
  tweet?: string
  createdAt: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="h-6 w-6 text-red-500" />
    case 'retweet':
      return <Repeat2 className="h-6 w-6 text-green-500" />
    case 'follow':
      return <UserPlus className="h-6 w-6 text-accent" />
    case 'comment':
      return <MessageCircle className="h-6 w-6 text-accent" />
    default:
      return null
  }
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
    }
  }, [session])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>

        {/* Notifications */}
        <div>
          {notifications.map((notification) => (
            <div key={notification.id} className="border-b border-border p-4 hover:bg-muted/50 transition-colors">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Avatar src={notification.user.image} alt={notification.user.name} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-bold">{notification.user.name}</span>{' '}
                        <span className="text-muted-foreground">{notification.content}</span>
                      </p>
                      {notification.tweet && (
                        <p className="text-sm text-muted-foreground mt-1">
                          "{notification.tweet}"
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTimeAgo(new Date(notification.createdAt || new Date().toISOString()))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}