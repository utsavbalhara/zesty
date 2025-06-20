import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'twitter.db')
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
  joined_at: string
}

export interface Tweet {
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
  tweet_id: string
  created_at: string
}

export interface Retweet {
  id: string
  user_id: string
  tweet_id: string
  created_at: string
}

export interface Comment {
  id: string
  content: string
  user_id: string
  tweet_id: string
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
  type: 'like' | 'retweet' | 'follow' | 'comment'
  actor_id: string
  tweet_id?: string
  read: boolean
  created_at: string
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

  // Tweet statements
  createTweet: Database.Statement
  findTweetById: Database.Statement
  getTweets: Database.Statement
  getTweetsByUser: Database.Statement

  // Like statements
  createLike: Database.Statement
  deleteLike: Database.Statement
  findLike: Database.Statement
  getLikesByTweet: Database.Statement

  // Retweet statements
  createRetweet: Database.Statement
  deleteRetweet: Database.Statement
  findRetweet: Database.Statement
  getRetweetsByTweet: Database.Statement

  // Comment statements
  createComment: Database.Statement
  getCommentsByTweet: Database.Statement

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

  constructor() {
    this.db = getDatabase()

    // Initialize user statements
    this.createUser = this.db.prepare(`
      INSERT INTO users (id, name, username, email, bio, location, website, image, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    this.findUserById = this.db.prepare('SELECT * FROM users WHERE id = ?')
    this.findUserByEmail = this.db.prepare('SELECT * FROM users WHERE email = ?')
    this.findUserByUsername = this.db.prepare('SELECT * FROM users WHERE username = ?')
    this.updateUser = this.db.prepare(`
      UPDATE users 
      SET name = ?, bio = ?, location = ?, website = ?, image = ?
      WHERE id = ?
    `)

    // Initialize tweet statements
    this.createTweet = this.db.prepare(`
      INSERT INTO tweets (id, content, image_url, author_id)
      VALUES (?, ?, ?, ?)
    `)
    this.findTweetById = this.db.prepare('SELECT * FROM tweets WHERE id = ?')
    this.getTweets = this.db.prepare(`
      SELECT 
        t.*,
        u.name as author_name,
        u.username as author_username,
        u.image as author_image,
        u.verified as author_verified,
        (SELECT COUNT(*) FROM likes WHERE tweet_id = t.id) as like_count,
        (SELECT COUNT(*) FROM retweets WHERE tweet_id = t.id) as retweet_count,
        (SELECT COUNT(*) FROM comments WHERE tweet_id = t.id) as comment_count
      FROM tweets t
      JOIN users u ON t.author_id = u.id
      ORDER BY t.created_at DESC
      LIMIT ?
    `)
    this.getTweetsByUser = this.db.prepare(`
      SELECT 
        t.*,
        u.name as author_name,
        u.username as author_username,
        u.image as author_image,
        u.verified as author_verified,
        (SELECT COUNT(*) FROM likes WHERE tweet_id = t.id) as like_count,
        (SELECT COUNT(*) FROM retweets WHERE tweet_id = t.id) as retweet_count,
        (SELECT COUNT(*) FROM comments WHERE tweet_id = t.id) as comment_count
      FROM tweets t
      JOIN users u ON t.author_id = u.id
      WHERE t.author_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `)

    // Initialize like statements
    this.createLike = this.db.prepare('INSERT INTO likes (id, user_id, tweet_id) VALUES (?, ?, ?)')
    this.deleteLike = this.db.prepare('DELETE FROM likes WHERE user_id = ? AND tweet_id = ?')
    this.findLike = this.db.prepare('SELECT * FROM likes WHERE user_id = ? AND tweet_id = ?')
    this.getLikesByTweet = this.db.prepare('SELECT user_id FROM likes WHERE tweet_id = ?')

    // Initialize retweet statements
    this.createRetweet = this.db.prepare('INSERT INTO retweets (id, user_id, tweet_id) VALUES (?, ?, ?)')
    this.deleteRetweet = this.db.prepare('DELETE FROM retweets WHERE user_id = ? AND tweet_id = ?')
    this.findRetweet = this.db.prepare('SELECT * FROM retweets WHERE user_id = ? AND tweet_id = ?')
    this.getRetweetsByTweet = this.db.prepare('SELECT user_id, created_at FROM retweets WHERE tweet_id = ?')

    // Initialize comment statements
    this.createComment = this.db.prepare('INSERT INTO comments (id, content, user_id, tweet_id) VALUES (?, ?, ?, ?)')
    this.getCommentsByTweet = this.db.prepare(`
      SELECT 
        c.*,
        u.name as user_name,
        u.username as user_username,
        u.image as user_image,
        u.verified as user_verified
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.tweet_id = ?
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
      INSERT INTO notifications (id, user_id, type, actor_id, tweet_id) 
      VALUES (?, ?, ?, ?, ?)
    `)
    this.getNotificationsByUser = this.db.prepare(`
      SELECT 
        n.*,
        u.name as actor_name,
        u.username as actor_username,
        u.image as actor_image,
        t.content as tweet_content
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      LEFT JOIN tweets t ON n.tweet_id = t.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ?
    `)
    this.markNotificationAsRead = this.db.prepare('UPDATE notifications SET read = 1 WHERE id = ?')
    this.markAllNotificationsAsRead = this.db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?')

    // Initialize stats statements
    this.getUserStats = this.db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM tweets WHERE author_id = ?) as tweets,
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following
    `)
  }
}

// Export singleton instance
export const statements = new PreparedStatements()