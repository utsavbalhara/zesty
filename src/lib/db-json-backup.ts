import fs from 'fs'
import path from 'path'

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

// Database structure
interface Database {
  users: User[]
  tweets: Tweet[]
  likes: Like[]
  retweets: Retweet[]
  comments: Comment[]
  follows: Follow[]
  messages: Message[]
  notifications: Notification[]
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  bio?: string
  location?: string
  website?: string
  image?: string
  verified: boolean
  joinedAt: string
}

export interface Tweet {
  id: string
  content: string
  imageUrl?: string
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface Like {
  id: string
  userId: string
  tweetId: string
  createdAt: string
}

export interface Retweet {
  id: string
  userId: string
  tweetId: string
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  userId: string
  tweetId: string
  createdAt: string
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
}

export interface Notification {
  id: string
  userId: string
  type: 'like' | 'retweet' | 'follow' | 'comment'
  actorId: string
  tweetId?: string
  createdAt: string
  read: boolean
}

// Initialize empty database
const initDB = (): Database => ({
  users: [],
  tweets: [],
  likes: [],
  retweets: [],
  comments: [],
  follows: [],
  messages: [],
  notifications: []
})

// Ensure data directory and database file exist
const ensureDB = () => {
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initDB(), null, 2))
  }
}

// Read database
const readDB = (): Database => {
  ensureDB()
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading database:', error)
    return initDB()
  }
}

// Write database
const writeDB = (data: Database) => {
  ensureDB()
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing database:', error)
  }
}

// Generate unique ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Get notification content text
const getNotificationContent = (type: Notification['type']): string => {
  switch (type) {
    case 'like':
      return 'liked your Tweet'
    case 'retweet':
      return 'retweeted your Tweet'
    case 'follow':
      return 'followed you'
    case 'comment':
      return 'replied to your Tweet'
    default:
      return 'interacted with your content'
  }
}

// Create notification helper
const createNotification = (userId: string, type: Notification['type'], actorId: string, tweetId?: string) => {
  const data = readDB()

  // Don't create notification for self-actions
  if (userId === actorId) return

  // Check if similar notification already exists (to avoid duplicates)
  const existingNotification = data.notifications.find(notif =>
    notif.userId === userId &&
    notif.type === type &&
    notif.actorId === actorId &&
    notif.tweetId === tweetId
  )

  if (!existingNotification) {
    const notification: Notification = {
      id: generateId(),
      userId,
      type,
      actorId,
      tweetId,
      createdAt: new Date().toISOString(),
      read: false,
    }
    data.notifications.push(notification)
    writeDB(data)
  }
}

// Database operations
export const db = {
  // User operations
  users: {
    create: (userData: Omit<User, 'id' | 'joinedAt'>) => {
      const data = readDB()
      const user: User = {
        ...userData,
        id: generateId(),
        joinedAt: new Date().toISOString(),
      }
      data.users.push(user)
      writeDB(data)
      return user
    },

    findByEmail: (email: string) => {
      const data = readDB()
      return data.users.find(user => user.email === email) || null
    },

    findByUsername: (username: string) => {
      const data = readDB()
      return data.users.find(user => user.username === username) || null
    },

    findById: (id: string) => {
      const data = readDB()
      return data.users.find(user => user.id === id) || null
    },

    update: (id: string, updates: Partial<User>) => {
      const data = readDB()
      const userIndex = data.users.findIndex(user => user.id === id)
      if (userIndex !== -1) {
        data.users[userIndex] = { ...data.users[userIndex], ...updates }
        writeDB(data)
        return data.users[userIndex]
      }
      return null
    },

    getStats: (userId: string) => {
      const data = readDB()
      return {
        tweets: data.tweets.filter(tweet => tweet.authorId === userId).length,
        followers: data.follows.filter(follow => follow.followingId === userId).length,
        following: data.follows.filter(follow => follow.followerId === userId).length,
      }
    },

    search: (query: string) => {
      const data = readDB()
      const searchTerm = query.toLowerCase()
      return data.users
        .filter(user =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm)
        )
        .map(user => ({
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
          verified: user.verified,
        }))
    }
  },

  // Tweet operations
  tweets: {
    create: (tweetData: Omit<Tweet, 'id' | 'createdAt' | 'updatedAt'>) => {
      const data = readDB()
      const tweet: Tweet = {
        ...tweetData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      data.tweets.push(tweet)
      writeDB(data)
      return tweet
    },

    findById: (id: string) => {
      const data = readDB()
      return data.tweets.find(tweet => tweet.id === id) || null
    },

    getAll: (limit = 50) => {
      const data = readDB()
      return data.tweets
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .map(tweet => {
          const author = data.users.find(user => user.id === tweet.authorId)
          const likes = data.likes.filter(like => like.tweetId === tweet.id)
          const retweets = data.retweets.filter(retweet => retweet.tweetId === tweet.id)
          const comments = data.comments.filter(comment => comment.tweetId === tweet.id)

          return {
            ...tweet,
            author: author ? {
              id: author.id,
              name: author.name,
              username: author.username,
              image: author.image,
              verified: author.verified,
            } : null,
            likes: likes.map(like => ({ userId: like.userId })),
            retweets: retweets.map(retweet => ({ userId: retweet.userId, createdAt: retweet.createdAt })),
            comments: comments.map(comment => ({ id: comment.id })),
            _count: {
              likes: likes.length,
              retweets: retweets.length,
              comments: comments.length,
            }
          }
        })
    },

    getByUser: (userId: string, limit = 50) => {
      const data = readDB()
      return data.tweets
        .filter(tweet => tweet.authorId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
    },

    delete: (id: string) => {
      const data = readDB()
      data.tweets = data.tweets.filter(tweet => tweet.id !== id)
      // Also delete related likes, retweets, comments
      data.likes = data.likes.filter(like => like.tweetId !== id)
      data.retweets = data.retweets.filter(retweet => retweet.tweetId !== id)
      data.comments = data.comments.filter(comment => comment.tweetId !== id)
      writeDB(data)
    }
  },

  // Like operations
  likes: {
    toggle: (userId: string, tweetId: string) => {
      const data = readDB()
      const existingLike = data.likes.find(like => like.userId === userId && like.tweetId === tweetId)

      if (existingLike) {
        // Unlike
        data.likes = data.likes.filter(like => like.id !== existingLike.id)
        writeDB(data)
        return { liked: false }
      } else {
        // Like
        const like: Like = {
          id: generateId(),
          userId,
          tweetId,
          createdAt: new Date().toISOString(),
        }
        data.likes.push(like)
        writeDB(data)

        // Create notification for tweet author
        const tweet = data.tweets.find(t => t.id === tweetId)
        if (tweet) {
          createNotification(tweet.authorId, 'like', userId, tweetId)
        }

        return { liked: true }
      }
    },

    getByTweet: (tweetId: string) => {
      const data = readDB()
      return data.likes.filter(like => like.tweetId === tweetId)
    }
  },

  // Retweet operations
  retweets: {
    toggle: (userId: string, tweetId: string) => {
      const data = readDB()
      const existingRetweet = data.retweets.find(retweet => retweet.userId === userId && retweet.tweetId === tweetId)

      if (existingRetweet) {
        // Unretweet
        data.retweets = data.retweets.filter(retweet => retweet.id !== existingRetweet.id)
        writeDB(data)
        return { retweeted: false }
      } else {
        // Retweet
        const retweet: Retweet = {
          id: generateId(),
          userId,
          tweetId,
          createdAt: new Date().toISOString(),
        }
        data.retweets.push(retweet)
        writeDB(data)

        // Create notification for tweet author
        const tweet = data.tweets.find(t => t.id === tweetId)
        if (tweet) {
          createNotification(tweet.authorId, 'retweet', userId, tweetId)
        }

        return { retweeted: true }
      }
    },

    getByTweet: (tweetId: string) => {
      const data = readDB()
      return data.retweets.filter(retweet => retweet.tweetId === tweetId)
    }
  },

  // Comment operations
  comments: {
    create: (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
      const data = readDB()
      const comment: Comment = {
        ...commentData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      data.comments.push(comment)
      writeDB(data)

      // Create notification for tweet author
      const tweet = data.tweets.find(t => t.id === commentData.tweetId)
      if (tweet) {
        createNotification(tweet.authorId, 'comment', commentData.userId, commentData.tweetId)
      }

      return comment
    },

    getByTweet: (tweetId: string) => {
      const data = readDB()
      return data.comments
        .filter(comment => comment.tweetId === tweetId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(comment => {
          const user = data.users.find(u => u.id === comment.userId)
          return {
            ...comment,
            user: user ? {
              id: user.id,
              name: user.name,
              username: user.username,
              image: user.image,
              verified: user.verified,
            } : null
          }
        })
    }
  },

  // Follow operations
  follows: {
    toggle: (followerId: string, followingId: string) => {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself')
      }

      const data = readDB()
      const existingFollow = data.follows.find(
        follow => follow.followerId === followerId && follow.followingId === followingId
      )

      if (existingFollow) {
        // Unfollow
        data.follows = data.follows.filter(follow => follow.id !== existingFollow.id)
        writeDB(data)
        return { following: false }
      } else {
        // Follow
        const follow: Follow = {
          id: generateId(),
          followerId,
          followingId,
          createdAt: new Date().toISOString(),
        }
        data.follows.push(follow)
        writeDB(data)

        // Create notification for followed user
        createNotification(followingId, 'follow', followerId)

        return { following: true }
      }
    },

    isFollowing: (followerId: string, followingId: string) => {
      const data = readDB()
      return data.follows.some(
        follow => follow.followerId === followerId && follow.followingId === followingId
      )
    },

    getFollowers: (userId: string) => {
      const data = readDB()
      return data.follows
        .filter(follow => follow.followingId === userId)
        .map(follow => data.users.find(user => user.id === follow.followerId))
        .filter(Boolean)
    },

    getFollowing: (userId: string) => {
      const data = readDB()
      return data.follows
        .filter(follow => follow.followerId === userId)
        .map(follow => data.users.find(user => user.id === follow.followingId))
        .filter(Boolean)
    }
  },

  // Messages operations
  messages: {
    create: (messageData: Omit<Message, 'id' | 'createdAt' | 'read'>) => {
      const data = readDB()
      if (!data.messages) {
        data.messages = []
      }
      const message: Message = {
        ...messageData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        read: false,
      }
      data.messages.push(message)
      writeDB(data)
      return message
    },

    getConversations: (userId: string) => {
      const data = readDB()
      if (!data.messages) {
        data.messages = []
        writeDB(data)
      }

      const userMessages = data.messages.filter(
        msg => msg.senderId === userId || msg.receiverId === userId
      )

      // Get unique conversation partners
      const partners = new Set<string>()
      userMessages.forEach(msg => {
        if (msg.senderId === userId) {
          partners.add(msg.receiverId)
        } else {
          partners.add(msg.senderId)
        }
      })

      // Create conversation objects
      const conversations = Array.from(partners).map(partnerId => {
        const partner = data.users.find(u => u.id === partnerId)
        if (!partner) return null

        // Get last message between these two users
        const conversationMessages = userMessages.filter(msg => 
          (msg.senderId === userId && msg.receiverId === partnerId) ||
          (msg.senderId === partnerId && msg.receiverId === userId)
        )
        
        const lastMessage = conversationMessages
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

        return {
          id: partnerId, // Use simple partner ID as conversation ID
          user: {
            id: partner.id,
            name: partner.name,
            username: partner.username,
            image: partner.image,
          },
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.createdAt || new Date().toISOString(),
          unread: conversationMessages.some(
            msg => msg.senderId === partnerId && msg.receiverId === userId && !msg.read
          ),
        }
      }).filter(Boolean)
      
      // Sort by last message time
      return conversations.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      )
    },

    getConversationMessages: (userId: string, partnerId: string) => {
      const data = readDB()
      if (!data.messages) {
        data.messages = []
        writeDB(data)
      }

      return data.messages
        .filter(
          msg =>
            (msg.senderId === userId && msg.receiverId === partnerId) ||
            (msg.senderId === partnerId && msg.receiverId === userId)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    },

    markAsRead: (userId: string, partnerId: string) => {
      const data = readDB()
      if (!data.messages) {
        data.messages = []
        writeDB(data)
      }

      data.messages = data.messages.map(msg => {
        if (msg.senderId === partnerId && msg.receiverId === userId && !msg.read) {
          return { ...msg, read: true }
        }
        return msg
      })
      writeDB(data)
    },
  },

  // Notification operations
  notifications: {
    getByUser: (userId: string) => {
      const data = readDB()
      return data.notifications
        .filter(notif => notif.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(notif => {
          const actor = data.users.find(u => u.id === notif.actorId)
          let tweet = null
          if (notif.tweetId) {
            tweet = data.tweets.find(t => t.id === notif.tweetId)
          }

          return {
            id: notif.id,
            type: notif.type,
            user: actor ? {
              id: actor.id,
              name: actor.name,
              username: actor.username,
              image: actor.image,
            } : null,
            content: getNotificationContent(notif.type),
            tweet: tweet?.content,
            createdAt: notif.createdAt,
            read: notif.read,
          }
        })
        .filter(notif => notif.user) // Filter out notifications where actor was deleted
    },

    markAsRead: (userId: string, notificationId?: string) => {
      const data = readDB()
      if (notificationId) {
        // Mark specific notification as read
        const notification = data.notifications.find(n => n.id === notificationId && n.userId === userId)
        if (notification) {
          notification.read = true
        }
      } else {
        // Mark all notifications as read for user
        data.notifications.forEach(notif => {
          if (notif.userId === userId) {
            notif.read = true
          }
        })
      }
      writeDB(data)
    },

    getUnreadCount: (userId: string) => {
      const data = readDB()
      return data.notifications.filter(notif => notif.userId === userId && !notif.read).length
    }
  },

  // Utility operations
  reset: () => {
    writeDB(initDB())
  },

  backup: () => {
    const data = readDB()
    const backupPath = path.join(process.cwd(), 'data', `backup_${Date.now()}.json`)
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2))
    return backupPath
  }
}
