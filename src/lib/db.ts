import { statements, generateId, getDatabase } from './sqlite'
import type { User, Tweet, Like, Retweet, Comment, Follow, Message, Notification } from './sqlite'

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
  // Don't create notification for self-actions
  if (userId === actorId) return
  
  try {
    const id = generateId()
    statements.createNotification.run(id, userId, type, actorId, tweetId || null)
  } catch (error) {
    // Ignore duplicate notifications
    console.log('Notification already exists or error:', error)
  }
}

// Database operations
export const db = {
  // User operations
  users: {
    create: (userData: Omit<User, 'id' | 'joined_at'>) => {
      const id = generateId()
      const now = new Date().toISOString()
      
      statements.createUser.run(
        id,
        userData.name,
        userData.username,
        userData.email,
        userData.bio || null,
        userData.location || null,
        userData.website || null,
        userData.image || null,
        userData.verified ? 1 : 0
      )
      
      return {
        id,
        ...userData,
        joined_at: now,
      }
    },

    findByEmail: (email: string) => {
      return statements.findUserByEmail.get(email) as User | undefined
    },

    findByUsername: (username: string) => {
      return statements.findUserByUsername.get(username) as User | undefined
    },

    findById: (id: string) => {
      return statements.findUserById.get(id) as User | undefined
    },

    update: (id: string, updates: Partial<User>) => {
      const user = statements.findUserById.get(id) as User | undefined
      if (!user) {
        throw new Error('User not found')
      }

      // Only allow updating certain fields for security
      const allowedFields = ['name', 'bio', 'location', 'website', 'image']
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key as keyof User]
          return obj
        }, {} as any)

      if (Object.keys(filteredUpdates).length === 0) {
        return user
      }

      statements.updateUser.run(
        filteredUpdates.name ?? user.name,
        filteredUpdates.bio ?? user.bio ?? null,
        filteredUpdates.location ?? user.location ?? null,
        filteredUpdates.website ?? user.website ?? null,
        filteredUpdates.image ?? user.image ?? null,
        id
      )

      // Return updated user
      return statements.findUserById.get(id) as User
    },

    getStats: (userId: string) => {
      const result = statements.getUserStats.get(userId, userId, userId) as any
      return {
        tweets: result.tweets || 0,
        followers: result.followers || 0,
        following: result.following || 0,
      }
    }
  },

  // Tweet operations
  tweets: {
    create: (tweetData: Omit<Tweet, 'id' | 'created_at' | 'updated_at'>) => {
      const id = generateId()
      const now = new Date().toISOString()
      
      statements.createTweet.run(
        id,
        tweetData.content,
        tweetData.image_url || null,
        tweetData.author_id
      )
      
      return {
        id,
        ...tweetData,
        created_at: now,
        updated_at: now,
      }
    },

    findById: (id: string) => {
      return statements.findTweetById.get(id) as Tweet | undefined
    },

    getAll: (limit = 50) => {
      const tweets = statements.getTweets.all(limit) as any[]
      
      return tweets.map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        imageUrl: tweet.image_url,
        createdAt: tweet.created_at,
        author: {
          id: tweet.author_id,
          name: tweet.author_name,
          username: tweet.author_username,
          image: tweet.author_image,
          verified: Boolean(tweet.author_verified),
        },
        likes: [], // Will be populated by separate queries if needed
        retweets: [],
        comments: [],
        _count: {
          likes: tweet.like_count || 0,
          retweets: tweet.retweet_count || 0,
          comments: tweet.comment_count || 0,
        }
      }))
    },

    getByUser: (userId: string, limit = 50) => {
      const tweets = statements.getTweetsByUser.all(userId, limit) as any[]
      
      return tweets.map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        imageUrl: tweet.image_url,
        createdAt: tweet.created_at,
        author: {
          id: tweet.author_id,
          name: tweet.author_name,
          username: tweet.author_username,
          image: tweet.author_image,
          verified: Boolean(tweet.author_verified),
        },
        likes: [],
        retweets: [],
        comments: [],
        _count: {
          likes: tweet.like_count || 0,
          retweets: tweet.retweet_count || 0,
          comments: tweet.comment_count || 0,
        }
      }))
    },

    delete: (id: string) => {
      // SQLite will handle cascading deletes via foreign keys
      const db = getDatabase()
      db.prepare('DELETE FROM tweets WHERE id = ?').run(id)
    }
  },

  // Like operations
  likes: {
    toggle: (userId: string, tweetId: string) => {
      const existingLike = statements.findLike.get(userId, tweetId)
      
      if (existingLike) {
        // Unlike
        statements.deleteLike.run(userId, tweetId)
        return { liked: false }
      } else {
        // Like
        const id = generateId()
        statements.createLike.run(id, userId, tweetId)
        
        // Create notification for tweet author
        const tweet = statements.findTweetById.get(tweetId) as Tweet
        if (tweet) {
          createNotification(tweet.author_id, 'like', userId, tweetId)
        }
        
        return { liked: true }
      }
    },

    getByTweet: (tweetId: string) => {
      return statements.getLikesByTweet.all(tweetId) as { user_id: string }[]
    }
  },

  // Retweet operations
  retweets: {
    toggle: (userId: string, tweetId: string) => {
      const existingRetweet = statements.findRetweet.get(userId, tweetId)
      
      if (existingRetweet) {
        // Unretweet
        statements.deleteRetweet.run(userId, tweetId)
        return { retweeted: false }
      } else {
        // Retweet
        const id = generateId()
        statements.createRetweet.run(id, userId, tweetId)
        
        // Create notification for tweet author
        const tweet = statements.findTweetById.get(tweetId) as Tweet
        if (tweet) {
          createNotification(tweet.author_id, 'retweet', userId, tweetId)
        }
        
        return { retweeted: true }
      }
    },

    getByTweet: (tweetId: string) => {
      return statements.getRetweetsByTweet.all(tweetId) as { user_id: string; created_at: string }[]
    }
  },

  // Comment operations
  comments: {
    create: (commentData: Omit<Comment, 'id' | 'created_at'>) => {
      const id = generateId()
      
      statements.createComment.run(
        id,
        commentData.content,
        commentData.user_id,
        commentData.tweet_id
      )
      
      // Create notification for tweet author
      const tweet = statements.findTweetById.get(commentData.tweet_id) as Tweet
      if (tweet) {
        createNotification(tweet.author_id, 'comment', commentData.user_id, commentData.tweet_id)
      }
      
      return {
        id,
        ...commentData,
        created_at: new Date().toISOString(),
      }
    },

    getByTweet: (tweetId: string) => {
      const comments = statements.getCommentsByTweet.all(tweetId) as any[]
      
      return comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        userId: comment.user_id,
        tweetId: comment.tweet_id,
        createdAt: comment.created_at,
        user: {
          id: comment.user_id,
          name: comment.user_name,
          username: comment.user_username,
          image: comment.user_image,
          verified: Boolean(comment.user_verified),
        }
      }))
    }
  },

  // Follow operations
  follows: {
    toggle: (followerId: string, followingId: string) => {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself')
      }

      const existingFollow = statements.findFollow.get(followerId, followingId)
      
      if (existingFollow) {
        // Unfollow
        statements.deleteFollow.run(followerId, followingId)
        return { following: false }
      } else {
        // Follow
        const id = generateId()
        statements.createFollow.run(id, followerId, followingId)
        
        // Create notification for followed user
        createNotification(followingId, 'follow', followerId)
        
        return { following: true }
      }
    },

    isFollowing: (followerId: string, followingId: string) => {
      const follow = statements.findFollow.get(followerId, followingId)
      return Boolean(follow)
    },

    getFollowers: (userId: string) => {
      // Implementation for getting followers list
      const db = getDatabase()
      const followers = db.prepare(`
        SELECT u.* FROM users u
        JOIN follows f ON u.id = f.follower_id
        WHERE f.following_id = ?
      `).all(userId) as User[]
      
      return followers
    },

    getFollowing: (userId: string) => {
      // Implementation for getting following list
      const db = getDatabase()
      const following = db.prepare(`
        SELECT u.* FROM users u
        JOIN follows f ON u.id = f.following_id
        WHERE f.follower_id = ?
      `).all(userId) as User[]
      
      return following
    }
  },

  // Message operations
  messages: {
    create: (messageData: Omit<Message, 'id' | 'created_at' | 'read'>) => {
      const id = generateId()
      const now = new Date().toISOString()
      
      statements.createMessage.run(
        id,
        messageData.sender_id,
        messageData.receiver_id,
        messageData.content
      )
      
      // Return in frontend-expected format
      return {
        id,
        senderId: messageData.sender_id,
        receiverId: messageData.receiver_id,
        content: messageData.content,
        createdAt: now,
        read: false,
      }
    },

    getConversations: (userId: string) => {
      const conversations = statements.getConversations.all(
        userId, userId, userId, userId, userId, userId
      ) as any[]
      
      return conversations.map(conv => ({
        id: conv.id,
        user: {
          id: conv.id,
          name: conv.name,
          username: conv.username,
          image: conv.image,
        },
        lastMessage: conv.last_message || '',
        lastMessageTime: conv.last_message_time || new Date().toISOString(),
        unread: Boolean(conv.unread),
      }))
    },

    getConversationMessages: (userId: string, partnerId: string) => {
      const messages = statements.getConversationMessages.all(
        userId, partnerId, partnerId, userId
      ) as Message[]
      
      // Transform to match frontend expectations
      return messages.map(message => ({
        id: message.id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        content: message.content,
        createdAt: message.created_at,
        read: message.read
      }))
    },

    markAsRead: (userId: string, partnerId: string) => {
      statements.markMessagesAsRead.run(partnerId, userId)
    }
  },

  // Notification operations
  notifications: {
    getByUser: (userId: string, limit = 50) => {
      const notifications = statements.getNotificationsByUser.all(userId, limit) as any[]
      
      return notifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        user: {
          id: notif.actor_id,
          name: notif.actor_name,
          username: notif.actor_username,
          image: notif.actor_image,
        },
        content: getNotificationContent(notif.type),
        tweet: notif.tweet_content,
        createdAt: notif.created_at,
        read: Boolean(notif.read),
      }))
    },

    markAsRead: (userId: string, notificationId?: string) => {
      if (notificationId) {
        statements.markNotificationAsRead.run(notificationId)
      } else {
        statements.markAllNotificationsAsRead.run(userId)
      }
    },

    getUnreadCount: (userId: string) => {
      const db = getDatabase()
      const result = db.prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
      ).get(userId) as { count: number }
      
      return result.count
    }
  },

  // Utility operations
  reset: () => {
    const db = getDatabase()
    // Clear all tables
    const tables = ['notifications', 'messages', 'follows', 'comments', 'retweets', 'likes', 'tweets', 'users']
    tables.forEach(table => {
      db.prepare(`DELETE FROM ${table}`).run()
    })
  },

  backup: () => {
    // SQLite backup would involve copying the database file
    const fs = require('fs')
    const path = require('path')
    const backupPath = path.join(process.cwd(), 'data', `backup_${Date.now()}.db`)
    const dbPath = path.join(process.cwd(), 'data', 'twitter.db')
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath)
      return backupPath
    }
    
    throw new Error('Database file not found')
  }
}