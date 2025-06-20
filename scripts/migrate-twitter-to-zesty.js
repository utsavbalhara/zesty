#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const twitterDbPath = path.join(process.cwd(), 'data', 'twitter.db');
const zestyDbPath = path.join(process.cwd(), 'data', 'zesty.db');

console.log('🔄 Starting migration from twitter.db to zesty.db...');

try {
  // Open both databases
  const twitterDb = new Database(twitterDbPath, { readonly: true });
  const zestyDb = new Database(zestyDbPath);

  // Start transaction
  zestyDb.exec('BEGIN TRANSACTION');

  try {
    // Clear existing data in zesty.db (in correct order to avoid foreign key constraints)
    console.log('🗑️  Clearing existing data...');
    zestyDb.exec('DELETE FROM notifications');
    zestyDb.exec('DELETE FROM messages');
    zestyDb.exec('DELETE FROM follows');
    zestyDb.exec('DELETE FROM comments');
    zestyDb.exec('DELETE FROM reposts');
    zestyDb.exec('DELETE FROM likes');
    zestyDb.exec('DELETE FROM posts');
    zestyDb.exec('DELETE FROM users');
    zestyDb.exec('DELETE FROM marketplace');

    // Migrate users (with NULL values for new academic columns)
    console.log('👥 Migrating users...');
    const users = twitterDb.prepare('SELECT * FROM users').all();
    const insertUser = zestyDb.prepare(`
      INSERT INTO users (id, name, username, email, bio, location, website, image, verified, degree, branch, section, hostel, joined_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?)
    `);
    
    for (const user of users) {
      insertUser.run(
        user.id, user.name, user.username, user.email, user.bio, 
        user.location, user.website, user.image, user.verified, user.joined_at
      );
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Migrate tweets to posts
    console.log('📝 Migrating tweets to posts...');
    const tweets = twitterDb.prepare('SELECT * FROM tweets').all();
    const insertPost = zestyDb.prepare(`
      INSERT INTO posts (id, content, image_url, author_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const tweet of tweets) {
      insertPost.run(
        tweet.id, tweet.content, tweet.image_url, tweet.author_id, 
        tweet.created_at, tweet.updated_at
      );
    }
    console.log(`✅ Migrated ${tweets.length} tweets to posts`);

    // Migrate likes (update tweet_id to post_id)
    console.log('❤️  Migrating likes...');
    const likes = twitterDb.prepare('SELECT * FROM likes').all();
    const insertLike = zestyDb.prepare(`
      INSERT INTO likes (id, user_id, post_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const like of likes) {
      insertLike.run(like.id, like.user_id, like.tweet_id, like.created_at);
    }
    console.log(`✅ Migrated ${likes.length} likes`);

    // Migrate retweets to reposts
    console.log('🔄 Migrating retweets to reposts...');
    const retweets = twitterDb.prepare('SELECT * FROM retweets').all();
    const insertRepost = zestyDb.prepare(`
      INSERT INTO reposts (id, user_id, post_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const retweet of retweets) {
      insertRepost.run(retweet.id, retweet.user_id, retweet.tweet_id, retweet.created_at);
    }
    console.log(`✅ Migrated ${retweets.length} retweets to reposts`);

    // Migrate comments
    console.log('💬 Migrating comments...');
    const comments = twitterDb.prepare('SELECT * FROM comments').all();
    const insertComment = zestyDb.prepare(`
      INSERT INTO comments (id, content, user_id, post_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const comment of comments) {
      insertComment.run(comment.id, comment.content, comment.user_id, comment.tweet_id, comment.created_at);
    }
    console.log(`✅ Migrated ${comments.length} comments`);

    // Migrate follows
    console.log('👥 Migrating follows...');
    const follows = twitterDb.prepare('SELECT * FROM follows').all();
    const insertFollow = zestyDb.prepare(`
      INSERT INTO follows (id, follower_id, following_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const follow of follows) {
      insertFollow.run(follow.id, follow.follower_id, follow.following_id, follow.created_at);
    }
    console.log(`✅ Migrated ${follows.length} follows`);

    // Migrate messages
    console.log('📨 Migrating messages...');
    const messages = twitterDb.prepare('SELECT * FROM messages').all();
    const insertMessage = zestyDb.prepare(`
      INSERT INTO messages (id, sender_id, receiver_id, content, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const message of messages) {
      insertMessage.run(
        message.id, message.sender_id, message.receiver_id, 
        message.content, message.read, message.created_at
      );
    }
    console.log(`✅ Migrated ${messages.length} messages`);

    // Migrate notifications
    console.log('🔔 Migrating notifications...');
    const notifications = twitterDb.prepare('SELECT * FROM notifications').all();
    const insertNotification = zestyDb.prepare(`
      INSERT INTO notifications (id, user_id, type, actor_id, post_id, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const notification of notifications) {
      insertNotification.run(
        notification.id, notification.user_id, notification.type, 
        notification.actor_id, notification.tweet_id, notification.read, notification.created_at
      );
    }
    console.log(`✅ Migrated ${notifications.length} notifications`);

    // Commit transaction
    zestyDb.exec('COMMIT');
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    // Rollback on error
    zestyDb.exec('ROLLBACK');
    throw error;
  } finally {
    // Close databases
    twitterDb.close();
    zestyDb.close();
  }

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}