-- Twitter Clone Database Schema
-- SQLite database for better performance

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    bio TEXT,
    location TEXT,
    website TEXT,
    image TEXT,
    verified BOOLEAN DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tweets table
CREATE TABLE IF NOT EXISTS tweets (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    image_url TEXT,
    author_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tweet_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE,
    UNIQUE(user_id, tweet_id)
);

-- Retweets table
CREATE TABLE IF NOT EXISTS retweets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tweet_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE,
    UNIQUE(user_id, tweet_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id TEXT NOT NULL,
    tweet_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    id TEXT PRIMARY KEY,
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'retweet', 'follow', 'comment')),
    actor_id TEXT NOT NULL,
    tweet_id TEXT,
    read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE
);

-- Performance Indexes
-- User lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tweet queries
CREATE INDEX IF NOT EXISTS idx_tweets_author_id ON tweets(author_id);
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tweets_author_created ON tweets(author_id, created_at DESC);

-- Interaction lookups
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_tweet_id ON likes(tweet_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_tweet ON likes(user_id, tweet_id);

CREATE INDEX IF NOT EXISTS idx_retweets_user_id ON retweets(user_id);
CREATE INDEX IF NOT EXISTS idx_retweets_tweet_id ON retweets(tweet_id);
CREATE INDEX IF NOT EXISTS idx_retweets_user_tweet ON retweets(user_id, tweet_id);

CREATE INDEX IF NOT EXISTS idx_comments_tweet_id ON comments(tweet_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Follow relationships
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_relationship ON follows(follower_id, following_id);

-- Message queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);