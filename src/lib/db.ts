import { statements, generateId, getDatabase } from './sqlite'
import type { User, Post, Comment, Message, Notification, MarketplaceItem } from './sqlite'

// Get notification content text
const getNotificationContent = (type: Notification['type']): string => {
  switch (type) {
    case 'like':
      return 'liked your Post'
    case 'repost':
      return 'reposted your Post'
    case 'follow':
      return 'followed you'
    case 'comment':
      return 'replied to your Post'
    default:
      return 'interacted with your content'
  }
}

// Create notification helper
const createNotification = (userId: string, type: Notification['type'], actorId: string, postId?: string) => {
  // Don't create notification for self-actions
  if (userId === actorId) return
  
  try {
    const id = generateId()
    statements.createNotification.run(id, userId, type, actorId, postId || null)
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
        userData.verified ? 1 : 0,
        userData.degree || null,
        userData.branch || null,
        userData.section || null,
        userData.hostel || null
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
      const allowedFields = ['name', 'bio', 'location', 'website', 'image', 'degree', 'branch', 'section', 'hostel']
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
        filteredUpdates.degree ?? user.degree ?? null,
        filteredUpdates.branch ?? user.branch ?? null,
        filteredUpdates.section ?? user.section ?? null,
        filteredUpdates.hostel ?? user.hostel ?? null,
        id
      )

      // Return updated user
      return statements.findUserById.get(id) as User
    },

    getStats: (userId: string) => {
      const result = statements.getUserStats.get(userId, userId, userId) as any
      return {
        posts: result.posts || 0,
        followers: result.followers || 0,
        following: result.following || 0,
      }
    },

    filterBy: (filters: { degree?: string; branch?: string; section?: number; hostel?: string }) => {
      return statements.getUsersByFilter.all(
        filters.degree || null, filters.degree || null,
        filters.branch || null, filters.branch || null,
        filters.section || null, filters.section || null,
        filters.hostel || null, filters.hostel || null
      ) as User[]
    }
  },

  // Post operations (renamed from tweets)
  posts: {
    create: (postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
      const id = generateId()
      const now = new Date().toISOString()
      
      statements.createPost.run(
        id,
        postData.content,
        postData.image_url || null,
        postData.author_id
      )
      
      return {
        id,
        ...postData,
        created_at: now,
        updated_at: now,
      }
    },

    findById: (id: string) => {
      return statements.findPostById.get(id) as Post | undefined
    },

    getAll: (limit = 50) => {
      const posts = statements.getPosts.all(limit) as any[]
      
      return posts.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        author: {
          id: post.author_id,
          name: post.author_name,
          username: post.author_username,
          image: post.author_image,
          verified: Boolean(post.author_verified),
        },
        likes: [], // Will be populated by separate queries if needed
        reposts: [],
        comments: [],
        _count: {
          likes: post.like_count || 0,
          reposts: post.repost_count || 0,
          comments: post.comment_count || 0,
        }
      }))
    },

    getByUser: (userId: string, limit = 50) => {
      const posts = statements.getPostsByUser.all(userId, limit) as any[]
      
      return posts.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        author: {
          id: post.author_id,
          name: post.author_name,
          username: post.author_username,
          image: post.author_image,
          verified: Boolean(post.author_verified),
        },
        likes: [],
        reposts: [],
        comments: [],
        _count: {
          likes: post.like_count || 0,
          reposts: post.repost_count || 0,
          comments: post.comment_count || 0,
        }
      }))
    },

    delete: (id: string) => {
      // SQLite will handle cascading deletes via foreign keys
      const db = getDatabase()
      db.prepare('DELETE FROM posts WHERE id = ?').run(id)
    }
  },

  // Like operations
  likes: {
    toggle: (userId: string, postId: string) => {
      const existingLike = statements.findLike.get(userId, postId)
      
      if (existingLike) {
        // Unlike
        statements.deleteLike.run(userId, postId)
        return { liked: false }
      } else {
        // Like
        const id = generateId()
        statements.createLike.run(id, userId, postId)
        
        // Create notification for post author
        const post = statements.findPostById.get(postId) as Post
        if (post) {
          createNotification(post.author_id, 'like', userId, postId)
        }
        
        return { liked: true }
      }
    },

    getByPost: (postId: string) => {
      return statements.getLikesByPost.all(postId) as { user_id: string }[]
    }
  },

  // Repost operations (renamed from retweets)
  reposts: {
    toggle: (userId: string, postId: string) => {
      const existingRepost = statements.findRepost.get(userId, postId)
      
      if (existingRepost) {
        // Unrepost
        statements.deleteRepost.run(userId, postId)
        return { reposted: false }
      } else {
        // Repost
        const id = generateId()
        statements.createRepost.run(id, userId, postId)
        
        // Create notification for post author
        const post = statements.findPostById.get(postId) as Post
        if (post) {
          createNotification(post.author_id, 'repost', userId, postId)
        }
        
        return { reposted: true }
      }
    },

    getByPost: (postId: string) => {
      return statements.getRepostsByPost.all(postId) as { user_id: string; created_at: string }[]
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
        commentData.post_id
      )
      
      // Create notification for post author
      const post = statements.findPostById.get(commentData.post_id) as Post
      if (post) {
        createNotification(post.author_id, 'comment', commentData.user_id, commentData.post_id)
      }
      
      return {
        id,
        ...commentData,
        created_at: new Date().toISOString(),
      }
    },

    getByPost: (postId: string) => {
      const comments = statements.getCommentsByPost.all(postId) as any[]
      
      return comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        userId: comment.user_id,
        postId: comment.post_id,
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
        post: notif.post_content,
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

  // Marketplace operations
  marketplace: {
    create: (itemData: Omit<MarketplaceItem, 'id' | 'created_at' | 'updated_at'>) => {
      const id = generateId()
      
      statements.createMarketplaceItem.run(
        id,
        itemData.title,
        itemData.description,
        itemData.price || null,
        itemData.category,
        itemData.condition || 'good',
        itemData.seller_id,
        itemData.images ? JSON.stringify(itemData.images) : null,
        itemData.videos ? JSON.stringify(itemData.videos) : null,
        itemData.status || 'available'
      )
      
      return statements.findMarketplaceItemById.get(id) as MarketplaceItem
    },

    findById: (id: string) => {
      const item = statements.findMarketplaceItemById.get(id) as any
      if (!item) return undefined
      
      return {
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        videos: item.videos ? JSON.parse(item.videos) : []
      } as MarketplaceItem
    },

    getAll: (limit = 50) => {
      const items = statements.getMarketplaceItems.all(limit) as any[]
      
      return items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        videos: item.videos ? JSON.parse(item.videos) : [],
        seller: {
          id: item.seller_id,
          name: item.seller_name,
          username: item.seller_username,
          image: item.seller_image
        }
      }))
    },

    getByUser: (userId: string, limit = 50) => {
      const items = statements.getMarketplaceItemsByUser.all(userId, limit) as any[]
      
      return items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        videos: item.videos ? JSON.parse(item.videos) : []
      }))
    },

    update: (id: string, updates: Partial<MarketplaceItem>) => {
      const item = statements.findMarketplaceItemById.get(id) as any
      if (!item) {
        throw new Error('Item not found')
      }

      statements.updateMarketplaceItem.run(
        updates.title || item.title,
        updates.description || item.description,
        updates.price !== undefined ? updates.price : item.price,
        updates.category || item.category,
        updates.condition || item.condition,
        updates.images ? JSON.stringify(updates.images) : item.images,
        updates.videos ? JSON.stringify(updates.videos) : item.videos,
        updates.status || item.status,
        id
      )

      return statements.findMarketplaceItemById.get(id) as MarketplaceItem
    },

    delete: (id: string) => {
      statements.deleteMarketplaceItem.run(id)
    }
  },

  // Utility operations
  reset: () => {
    const db = getDatabase()
    // Clear all tables
    const tables = ['marketplace', 'notifications', 'messages', 'follows', 'comments', 'reposts', 'likes', 'posts', 'users']
    tables.forEach(table => {
      db.prepare(`DELETE FROM ${table}`).run()
    })
  },

  backup: () => {
    // SQLite backup would involve copying the database file
    const fs = require('fs')
    const path = require('path')
    const backupPath = path.join(process.cwd(), 'data', `backup_${Date.now()}.db`)
    const dbPath = path.join(process.cwd(), 'data', 'zesty.db')
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath)
      return backupPath
    }
    
    throw new Error('Database file not found')
  }
}