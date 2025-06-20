const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

// Paths
const JSON_DB_PATH = path.join(process.cwd(), 'data', 'db.json')
const SQLITE_DB_PATH = path.join(process.cwd(), 'data', 'twitter.db')
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'schema.sql')

function migrateToSQLite() {
  console.log('🔄 Starting migration from JSON to SQLite...')

  // Check if JSON database exists
  if (!fs.existsSync(JSON_DB_PATH)) {
    console.log('❌ JSON database not found. Creating new SQLite database...')
    initializeEmptyDatabase()
    return
  }

  try {
    // Read JSON data
    console.log('📖 Reading JSON database...')
    const jsonData = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'))
    
    // Create SQLite database
    console.log('🗃️ Creating SQLite database...')
    const db = new Database(SQLITE_DB_PATH)
    
    // Configure SQLite for performance
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.pragma('foreign_keys = ON')
    
    // Initialize schema
    console.log('📋 Initializing schema...')
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8')
    db.exec(schema)
    
    // Prepare statements
    const statements = {
      insertUser: db.prepare(`
        INSERT INTO users (id, name, username, email, bio, location, website, image, verified, joined_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      insertTweet: db.prepare(`
        INSERT INTO tweets (id, content, image_url, author_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `),
      insertLike: db.prepare(`
        INSERT INTO likes (id, user_id, tweet_id, created_at)
        VALUES (?, ?, ?, ?)
      `),
      insertRetweet: db.prepare(`
        INSERT INTO retweets (id, user_id, tweet_id, created_at)
        VALUES (?, ?, ?, ?)
      `),
      insertComment: db.prepare(`
        INSERT INTO comments (id, content, user_id, tweet_id, created_at)
        VALUES (?, ?, ?, ?, ?)
      `),
      insertFollow: db.prepare(`
        INSERT INTO follows (id, follower_id, following_id, created_at)
        VALUES (?, ?, ?, ?)
      `),
      insertMessage: db.prepare(`
        INSERT INTO messages (id, sender_id, receiver_id, content, read, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `),
      insertNotification: db.prepare(`
        INSERT INTO notifications (id, user_id, type, actor_id, tweet_id, read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
    }

    // Start transaction for better performance
    const migrate = db.transaction(() => {
      // Migrate users
      if (jsonData.users && jsonData.users.length > 0) {
        console.log(`👥 Migrating ${jsonData.users.length} users...`)
        jsonData.users.forEach(user => {
          statements.insertUser.run(
            user.id,
            user.name,
            user.username,
            user.email,
            user.bio || null,
            user.location || null,
            user.website || null,
            user.image || null,
            user.verified ? 1 : 0,
            user.joinedAt || new Date().toISOString()
          )
        })
      }

      // Migrate tweets
      if (jsonData.tweets && jsonData.tweets.length > 0) {
        console.log(`🐦 Migrating ${jsonData.tweets.length} tweets...`)
        jsonData.tweets.forEach(tweet => {
          statements.insertTweet.run(
            tweet.id,
            tweet.content,
            tweet.imageUrl || null,
            tweet.authorId,
            tweet.createdAt,
            tweet.updatedAt || tweet.createdAt
          )
        })
      }

      // Migrate likes
      if (jsonData.likes && jsonData.likes.length > 0) {
        console.log(`❤️ Migrating ${jsonData.likes.length} likes...`)
        jsonData.likes.forEach(like => {
          statements.insertLike.run(
            like.id,
            like.userId,
            like.tweetId,
            like.createdAt
          )
        })
      }

      // Migrate retweets
      if (jsonData.retweets && jsonData.retweets.length > 0) {
        console.log(`🔄 Migrating ${jsonData.retweets.length} retweets...`)
        jsonData.retweets.forEach(retweet => {
          statements.insertRetweet.run(
            retweet.id,
            retweet.userId,
            retweet.tweetId,
            retweet.createdAt
          )
        })
      }

      // Migrate comments
      if (jsonData.comments && jsonData.comments.length > 0) {
        console.log(`💬 Migrating ${jsonData.comments.length} comments...`)
        jsonData.comments.forEach(comment => {
          statements.insertComment.run(
            comment.id,
            comment.content,
            comment.userId,
            comment.tweetId,
            comment.createdAt
          )
        })
      }

      // Migrate follows
      if (jsonData.follows && jsonData.follows.length > 0) {
        console.log(`👥 Migrating ${jsonData.follows.length} follows...`)
        jsonData.follows.forEach(follow => {
          statements.insertFollow.run(
            follow.id,
            follow.followerId,
            follow.followingId,
            follow.createdAt
          )
        })
      }

      // Migrate messages
      if (jsonData.messages && jsonData.messages.length > 0) {
        console.log(`📧 Migrating ${jsonData.messages.length} messages...`)
        jsonData.messages.forEach(message => {
          statements.insertMessage.run(
            message.id,
            message.senderId,
            message.receiverId,
            message.content,
            message.read ? 1 : 0,
            message.createdAt
          )
        })
      }

      // Migrate notifications
      if (jsonData.notifications && jsonData.notifications.length > 0) {
        console.log(`🔔 Migrating ${jsonData.notifications.length} notifications...`)
        jsonData.notifications.forEach(notification => {
          statements.insertNotification.run(
            notification.id,
            notification.userId,
            notification.type,
            notification.actorId,
            notification.tweetId || null,
            notification.read ? 1 : 0,
            notification.createdAt
          )
        })
      }
    })

    // Execute migration
    migrate()
    
    // Close database
    db.close()
    
    // Backup original JSON file
    const backupPath = path.join(process.cwd(), 'data', `db_backup_${Date.now()}.json`)
    fs.copyFileSync(JSON_DB_PATH, backupPath)
    console.log(`📦 JSON database backed up to: ${backupPath}`)
    
    console.log('✅ Migration completed successfully!')
    console.log(`📊 SQLite database created: ${SQLITE_DB_PATH}`)
    
    // Show statistics
    const statsDb = new Database(SQLITE_DB_PATH)
    const stats = {
      users: statsDb.prepare('SELECT COUNT(*) as count FROM users').get().count,
      tweets: statsDb.prepare('SELECT COUNT(*) as count FROM tweets').get().count,
      likes: statsDb.prepare('SELECT COUNT(*) as count FROM likes').get().count,
      retweets: statsDb.prepare('SELECT COUNT(*) as count FROM retweets').get().count,
      comments: statsDb.prepare('SELECT COUNT(*) as count FROM comments').get().count,
      follows: statsDb.prepare('SELECT COUNT(*) as count FROM follows').get().count,
      messages: statsDb.prepare('SELECT COUNT(*) as count FROM messages').get().count,
      notifications: statsDb.prepare('SELECT COUNT(*) as count FROM notifications').get().count,
    }
    statsDb.close()
    
    console.log('\n📈 Migration Statistics:')
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   ${table}: ${count}`)
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

function initializeEmptyDatabase() {
  try {
    console.log('🗃️ Creating empty SQLite database...')
    const db = new Database(SQLITE_DB_PATH)
    
    // Configure SQLite
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.pragma('foreign_keys = ON')
    
    // Initialize schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8')
    db.exec(schema)
    
    db.close()
    console.log('✅ Empty SQLite database created successfully!')
    
  } catch (error) {
    console.error('❌ Failed to create empty database:', error)
    process.exit(1)
  }
}

// Run migration
migrateToSQLite()