import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'zesty.db')
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'schema.sql')

// Global database instance
let db: Database.Database | null = null

// Initialize database connection
export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Create database connection
    db = new Database(DB_PATH)
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.pragma('cache_size = 1000000')
    db.pragma('foreign_keys = ON')
    
    // Initialize schema
    initializeSchema()
  }
  
  return db
}

// Initialize database schema
function initializeSchema() {
  if (!db) return
  
  try {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8')
    db.exec(schema)
    console.log('✅ Database schema initialized')
  } catch (error) {
    console.error('❌ Error initializing schema:', error)
    throw error
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Close database connection
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

// Database operations interface
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
  degree?: string
  branch?: string
  section?: number
  hostel?: string
  joined_at: string
}

export interface Post {
  id: string
  content: string
  image_url?: string
  author_id: string
  created_at: string
  updated_at: string
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Repost {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Comment {
  id: string
  content: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'repost' | 'follow' | 'comment'
  actor_id: string
  post_id?: string
  read: boolean
  created_at: string
}

export interface MarketplaceItem {
  id: string
  title: string
  description: string
  price?: number
  category: string
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  seller_id: string
  images?: string[]
  videos?: string[]
  status: 'available' | 'sold' | 'reserved'
  created_at: string
  updated_at: string
}

// Prepared statements for better performance
export class PreparedStatements {
  private db: Database.Database

  // User statements
  createUser: Database.Statement
  findUserById: Database.Statement
  findUserByEmail: Database.Statement
  findUserByUsername: Database.Statement
  updateUser: Database.Statement

  // Post statements (renamed from tweets)
  createPost: Database.Statement
  findPostById: Database.Statement
  getPosts: Database.Statement
  getPostsByUser: Database.Statement

  // Like statements
  createLike: Database.Statement
  deleteLike: Database.Statement
  findLike: Database.Statement
  getLikesByPost: Database.Statement

  // Repost statements (renamed from retweets)
  createRepost: Database.Statement
  deleteRepost: Database.Statement
  findRepost: Database.Statement
  getRepostsByPost: Database.Statement

  // Comment statements
  createComment: Database.Statement
  getCommentsByPost: Database.Statement

  // Follow statements
  createFollow: Database.Statement
  deleteFollow: Database.Statement
  findFollow: Database.Statement
  getFollowerCount: Database.Statement
  getFollowingCount: Database.Statement

  // Message statements
  createMessage: Database.Statement
  getConversations: Database.Statement
  getConversationMessages: Database.Statement
  markMessagesAsRead: Database.Statement

  // Notification statements
  createNotification: Database.Statement
  getNotificationsByUser: Database.Statement
  markNotificationAsRead: Database.Statement
  markAllNotificationsAsRead: Database.Statement

  // Stats statements
  getUserStats: Database.Statement

  // College filter statements
  getUsersByFilter: Database.Statement

  // Marketplace statements
  createMarketplaceItem: Database.Statement
  findMarketplaceItemById: Database.Statement
  getMarketplaceItems: Database.Statement
  getMarketplaceItemsByUser: Database.Statement
  updateMarketplaceItem: Database.Statement
  deleteMarketplaceItem: Database.Statement

  constructor() {
    this.db = getDatabase()

    // Initialize user statements
    this.createUser = this.db.prepare(`
      INSERT INTO users (id, name, username, email, bio, location, website, image, verified, degree, branch, section, hostel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    this.findUserById = this.db.prepare('SELECT * FROM users WHERE id = ?')
    this.findUserByEmail = this.db.prepare('SELECT * FROM users WHERE email = ?')
    this.findUserByUsername = this.db.prepare('SELECT * FROM users WHERE username = ?')
    this.updateUser = this.db.prepare(`
      UPDATE users 
      SET name = ?, bio = ?, location = ?, website = ?, image = ?, degree = ?, branch = ?, section = ?, hostel = ?
      WHERE id = ?
    `)

    // Initialize post statements (renamed from tweets)
    this.createPost = this.db.prepare(`
      INSERT INTO posts (id, content, image_url, author_id)
      VALUES (?, ?, ?, ?)
    `)
    this.findPostById = this.db.prepare('SELECT * FROM posts WHERE id = ?')
    this.getPosts = this.db.prepare(`
      SELECT 
        t.*,
        u.name as author_name,
        u.username as author_username,
        u.image as author_image,
        u.verified as author_verified,
        (SELECT COUNT(*) FROM likes WHERE post_id = t.id) as like_count,
        (SELECT COUNT(*) FROM reposts WHERE post_id = t.id) as repost_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = t.id) as comment_count
      FROM posts t
      JOIN users u ON t.author_id = u.id
      ORDER BY t.created_at DESC
      LIMIT ?
    `)
    this.getPostsByUser = this.db.prepare(`
      SELECT 
        t.*,
        u.name as author_name,
        u.username as author_username,
        u.image as author_image,
        u.verified as author_verified,
        (SELECT COUNT(*) FROM likes WHERE post_id = t.id) as like_count,
        (SELECT COUNT(*) FROM reposts WHERE post_id = t.id) as repost_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = t.id) as comment_count
      FROM posts t
      JOIN users u ON t.author_id = u.id
      WHERE t.author_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `)

    // Initialize like statements
    this.createLike = this.db.prepare('INSERT INTO likes (id, user_id, post_id) VALUES (?, ?, ?)')
    this.deleteLike = this.db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?')
    this.findLike = this.db.prepare('SELECT * FROM likes WHERE user_id = ? AND post_id = ?')
    this.getLikesByPost = this.db.prepare('SELECT user_id FROM likes WHERE post_id = ?')

    // Initialize repost statements (renamed from retweets)
    this.createRepost = this.db.prepare('INSERT INTO reposts (id, user_id, post_id) VALUES (?, ?, ?)')
    this.deleteRepost = this.db.prepare('DELETE FROM reposts WHERE user_id = ? AND post_id = ?')
    this.findRepost = this.db.prepare('SELECT * FROM reposts WHERE user_id = ? AND post_id = ?')
    this.getRepostsByPost = this.db.prepare('SELECT user_id, created_at FROM reposts WHERE post_id = ?')

    // Initialize comment statements
    this.createComment = this.db.prepare('INSERT INTO comments (id, content, user_id, post_id) VALUES (?, ?, ?, ?)')
    this.getCommentsByPost = this.db.prepare(`
      SELECT 
        c.*,
        u.name as user_name,
        u.username as user_username,
        u.image as user_image,
        u.verified as user_verified
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `)

    // Initialize follow statements
    this.createFollow = this.db.prepare('INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)')
    this.deleteFollow = this.db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?')
    this.findFollow = this.db.prepare('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?')
    this.getFollowerCount = this.db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?')
    this.getFollowingCount = this.db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?')

    // Initialize message statements
    this.createMessage = this.db.prepare('INSERT INTO messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)')
    this.getConversations = this.db.prepare(`
      WITH conversation_partners AS (
        SELECT DISTINCT 
          CASE 
            WHEN sender_id = ? THEN receiver_id 
            ELSE sender_id 
          END as partner_id
        FROM messages 
        WHERE sender_id = ? OR receiver_id = ?
      ),
      last_messages AS (
        SELECT 
          cp.partner_id,
          m.content as last_message,
          m.created_at as last_message_time,
          ROW_NUMBER() OVER (PARTITION BY cp.partner_id ORDER BY m.created_at DESC) as rn
        FROM conversation_partners cp
        JOIN messages m ON (
          (m.sender_id = ? AND m.receiver_id = cp.partner_id) OR 
          (m.sender_id = cp.partner_id AND m.receiver_id = ?)
        )
      )
      SELECT 
        lm.partner_id as id,
        u.name,
        u.username,
        u.image,
        lm.last_message,
        lm.last_message_time,
        CASE WHEN EXISTS(
          SELECT 1 FROM messages 
          WHERE sender_id = lm.partner_id AND receiver_id = ? AND read = 0
        ) THEN 1 ELSE 0 END as unread
      FROM last_messages lm
      JOIN users u ON lm.partner_id = u.id
      WHERE lm.rn = 1
      ORDER BY lm.last_message_time DESC
    `)
    this.getConversationMessages = this.db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `)
    this.markMessagesAsRead = this.db.prepare(`
      UPDATE messages 
      SET read = 1 
      WHERE sender_id = ? AND receiver_id = ? AND read = 0
    `)

    // Initialize notification statements
    this.createNotification = this.db.prepare(`
      INSERT INTO notifications (id, user_id, type, actor_id, post_id) 
      VALUES (?, ?, ?, ?, ?)
    `)
    this.getNotificationsByUser = this.db.prepare(`
      SELECT 
        n.*,
        u.name as actor_name,
        u.username as actor_username,
        u.image as actor_image,
        t.content as post_content
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      LEFT JOIN posts t ON n.post_id = t.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ?
    `)
    this.markNotificationAsRead = this.db.prepare('UPDATE notifications SET read = 1 WHERE id = ?')
    this.markAllNotificationsAsRead = this.db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?')

    // Initialize stats statements
    this.getUserStats = this.db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE author_id = ?) as posts,
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following
    `)

    // Initialize college filter statements
    this.getUsersByFilter = this.db.prepare(`
      SELECT * FROM users 
      WHERE (? IS NULL OR degree = ?)
        AND (? IS NULL OR branch = ?)
        AND (? IS NULL OR section = ?)
        AND (? IS NULL OR hostel = ?)
      ORDER BY name
    `)

    // Initialize marketplace statements
    this.createMarketplaceItem = this.db.prepare(`
      INSERT INTO marketplace (id, title, description, price, category, condition, seller_id, images, videos, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    this.findMarketplaceItemById = this.db.prepare('SELECT * FROM marketplace WHERE id = ?')
    this.getMarketplaceItems = this.db.prepare(`
      SELECT 
        m.*,
        u.name as seller_name,
        u.username as seller_username,
        u.image as seller_image
      FROM marketplace m
      JOIN users u ON m.seller_id = u.id
      WHERE m.status = 'available'
      ORDER BY m.created_at DESC
      LIMIT ?
    `)
    this.getMarketplaceItemsByUser = this.db.prepare(`
      SELECT * FROM marketplace 
      WHERE seller_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
    this.updateMarketplaceItem = this.db.prepare(`
      UPDATE marketplace 
      SET title = ?, description = ?, price = ?, category = ?, condition = ?, images = ?, videos = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    this.deleteMarketplaceItem = this.db.prepare('DELETE FROM marketplace WHERE id = ?')
  }
}

// Export singleton instance
export const statements = new PreparedStatements()