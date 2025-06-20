'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { PostCard } from '@/components/tweet/TweetCard'
import { formatNumber } from '@/lib/utils'
import { Calendar, MapPin, Link as LinkIcon, ArrowLeft, MessageCircle, GraduationCap, Building2 } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  username: string
  email: string
  image: string | null
  bio: string | null
  location: string | null
  website: string | null
  joinedAt: string
  verified: boolean
  degree?: string | null
  branch?: string | null
  section?: number | null
  hostel?: string | null
}

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
  retweets: { userId: string; createdAt: string }[]
  comments: { id: string }[]
  _count: {
    likes: number
    retweets: number
    comments: number
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [userStats, setUserStats] = useState({ posts: 0, followers: 0, following: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')

  const fetchUserData = async () => {
    try {
      setIsLoading(true)

      // Fetch user by username
      const userResponse = await fetch(`/api/users/profile/${username}`)
      if (!userResponse.ok) {
        throw new Error('User not found')
      }

      const userData = await userResponse.json()
      setUser(userData.user)
      setUserStats(userData.stats)
      setIsFollowing(userData.isFollowing)

      // Fetch user's posts
      const postsResponse = await fetch(`/api/users/${userData.user.id}/posts`)
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setPosts(postsData.posts)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (username) {
      fetchUserData()
    }
  }, [username])

  const handleFollow = async () => {
    if (!session?.user?.id || !user || isFollowLoading) return

    setIsFollowLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        setIsFollowing(result.following)

        // Update follower count
        setUserStats(prev => ({
          ...prev,
          followers: result.following ? prev.followers + 1 : prev.followers - 1
        }))
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleMessage = () => {
    if (user) {
      // Use Next.js router to navigate to messages with the user ID
      router.push(`/messages?user=${user.id}`)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground mt-2">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </MainLayout>
    )
  }

  const isOwnProfile = session?.user?.id === user.id

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">
                {formatNumber(userStats.posts)} Posts
              </p>
            </div>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-accent to-blue-600"></div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <Avatar src={user.image} alt={user.name || ''} size="lg" className="h-32 w-32 border-4 border-background" />
            <div className="mt-16 flex gap-2">
              {isOwnProfile ? (
                <Button variant="outline">Edit profile</Button>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                  >
                    {isFollowLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleMessage}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">{user.name}</h1>
                {user.verified && (
                  <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.265-.177-.335-.538-.156-.804.178-.266.538-.336.804-.156l1.921 1.281 3.957-5.936c.178-.267.538-.336.804-.16.267.178.336.537.16.804z"/>
                  </svg>
                )}
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {user.bio && (
              <p className="text-foreground">{user.bio}</p>
            )}

            {/* Academic Information */}
            {(user.degree || user.branch || user.section || user.hostel) && (
              <div className="flex flex-wrap gap-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                {user.degree && (
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>{user.degree}</span>
                    {user.branch && <span>in {user.branch}</span>}
                    {user.section && <span>- Section {user.section}</span>}
                  </div>
                )}
                {user.hostel && (
                  <div className="flex items-center space-x-1">
                    <Building2 className="h-4 w-4" />
                    <span>{user.hostel} Hostel</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href={user.website} className="text-accent hover:underline">
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex space-x-6 text-sm">
              <div>
                <span className="font-bold">{formatNumber(userStats.following)}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold">{formatNumber(userStats.followers)}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            {['posts', 'replies', 'media', 'likes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-foreground border-b-2 border-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'posts' && (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          {activeTab !== 'posts' && (
            <div className="text-center p-8 text-muted-foreground">
              <p>No {activeTab} yet.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
