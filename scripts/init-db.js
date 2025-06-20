const fs = require('fs')
const path = require('path')

// Import our JSON database
const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.ts')

// Since we can't import TypeScript directly in Node.js, we'll create the JSON directly
function createInitialData() {
  const dataDir = path.join(process.cwd(), 'data')
  const dbFile = path.join(dataDir, 'db.json')
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log('📁 Created data directory')
  }

  // Check if database already exists and has data
  if (fs.existsSync(dbFile)) {
    const existingData = JSON.parse(fs.readFileSync(dbFile, 'utf8'))
    if (existingData.users && existingData.users.length > 0) {
      console.log('✅ Database already has data!')
      console.log('')
      console.log('🔑 Demo Accounts:')
      console.log('   📧 demo@twitter.com (password: demo123)')
      console.log('   📧 john@example.com (password: john123)')
      console.log('   📧 jane@example.com (password: jane123)')
      console.log('')
      console.log('🎉 Database ready!')
      return
    }
  }

  console.log('🔄 Creating demo data...')

  // Generate IDs
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  // Create demo users
  const demoUser = {
    id: generateId(),
    name: 'Demo User',
    username: 'demo',
    email: 'demo@twitter.com',
    bio: 'This is a demo account for the Twitter clone! 🚀 Built with Next.js, TypeScript, and JSON database.',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    image: null,
    verified: true,
    joinedAt: now,
  }

  const johnUser = {
    id: generateId(),
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'Software developer passionate about React and TypeScript 💻',
    location: 'New York, NY',
    website: null,
    image: null,
    verified: false,
    joinedAt: now,
  }

  const janeUser = {
    id: generateId(),
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    bio: 'UI/UX Designer | Creating beautiful digital experiences ✨',
    location: 'Los Angeles, CA',
    website: null,
    image: null,
    verified: true,
    joinedAt: now,
  }

  // Create demo tweets
  const tweets = [
    {
      id: generateId(),
      content: 'Welcome to our Twitter clone! This is built with Next.js, TypeScript, and a JSON database. All the core features are working perfectly! 🎉',
      imageUrl: null,
      authorId: demoUser.id,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      content: 'The authentication system is working perfectly! You can sign up and start tweeting immediately. 🔐',
      imageUrl: null,
      authorId: demoUser.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      content: 'All the core Twitter features are implemented: likes, retweets, comments, follows, and user profiles! ❤️',
      imageUrl: null,
      authorId: demoUser.id,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      content: 'Just discovered this amazing Twitter clone! The UI is spot-on and everything works smoothly. Great work! 👏',
      imageUrl: null,
      authorId: johnUser.id,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      content: 'The design of this Twitter clone is absolutely beautiful! Love the attention to detail in the UI/UX. 🎨',
      imageUrl: null,
      authorId: janeUser.id,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      content: 'Working on some exciting new features for this project. The development experience with Next.js is incredible! 🚀',
      imageUrl: null,
      authorId: johnUser.id,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    }
  ]

  // Create likes
  const likes = [
    { id: generateId(), userId: johnUser.id, tweetId: tweets[0].id, createdAt: now },
    { id: generateId(), userId: janeUser.id, tweetId: tweets[0].id, createdAt: now },
    { id: generateId(), userId: demoUser.id, tweetId: tweets[3].id, createdAt: now },
    { id: generateId(), userId: janeUser.id, tweetId: tweets[3].id, createdAt: now },
    { id: generateId(), userId: demoUser.id, tweetId: tweets[4].id, createdAt: now },
    { id: generateId(), userId: johnUser.id, tweetId: tweets[4].id, createdAt: now },
  ]

  // Create retweets
  const retweets = [
    { id: generateId(), userId: johnUser.id, tweetId: tweets[0].id, createdAt: now },
    { id: generateId(), userId: janeUser.id, tweetId: tweets[2].id, createdAt: now },
    { id: generateId(), userId: demoUser.id, tweetId: tweets[4].id, createdAt: now },
  ]

  // Create follow relationships
  const follows = [
    { id: generateId(), followerId: johnUser.id, followingId: demoUser.id, createdAt: now },
    { id: generateId(), followerId: janeUser.id, followingId: demoUser.id, createdAt: now },
    { id: generateId(), followerId: demoUser.id, followingId: johnUser.id, createdAt: now },
    { id: generateId(), followerId: demoUser.id, followingId: janeUser.id, createdAt: now },
    { id: generateId(), followerId: johnUser.id, followingId: janeUser.id, createdAt: now },
  ]

  // Create comments
  const comments = [
    {
      id: generateId(),
      content: 'This is amazing! Great work on the Twitter clone! 🎉',
      userId: johnUser.id,
      tweetId: tweets[0].id,
      createdAt: now,
    },
    {
      id: generateId(),
      content: 'Love the clean design and smooth functionality! 💯',
      userId: janeUser.id,
      tweetId: tweets[0].id,
      createdAt: now,
    }
  ]

  // Create messages
  const messages = [
    {
      id: generateId(),
      senderId: johnUser.id,
      receiverId: demoUser.id,
      content: 'Hey! Love your Twitter clone project. The UI looks amazing!',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: generateId(),
      senderId: demoUser.id,
      receiverId: johnUser.id,
      content: 'Thanks! I\'m really excited about how it turned out. Still adding more features!',
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: generateId(),
      senderId: janeUser.id,
      receiverId: demoUser.id,
      content: 'The design is so clean! Did you use Tailwind for the styling?',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: false,
    }
  ]

  // Create notifications
  const notifications = [
    {
      id: generateId(),
      userId: demoUser.id,
      type: 'like',
      actorId: johnUser.id,
      tweetId: tweets[0].id,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: generateId(),
      userId: demoUser.id,
      type: 'follow',
      actorId: janeUser.id,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: generateId(),
      userId: demoUser.id,
      type: 'retweet',
      actorId: johnUser.id,
      tweetId: tweets[2].id,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: true,
    }
  ]

  // Create the complete database
  const database = {
    users: [demoUser, johnUser, janeUser],
    tweets,
    likes,
    retweets,
    comments,
    follows,
    messages,
    notifications
  }

  // Write to file
  fs.writeFileSync(dbFile, JSON.stringify(database, null, 2))

  console.log('✅ Demo users and content created!')
  console.log('')
  console.log('🔑 Demo Accounts:')
  console.log('   📧 demo@twitter.com (password: demo123)')
  console.log('   📧 john@example.com (password: john123)')
  console.log('   📧 jane@example.com (password: jane123)')
  console.log('')
  console.log('🎉 Database initialization complete!')
  console.log(`📊 Database location: ${dbFile}`)
}

function main() {
  try {
    console.log('🔄 Initializing JSON database...')
    createInitialData()
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }
}

main()