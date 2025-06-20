#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up Twitter Clone with JSON Database...\n')

try {
  // 1. Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!')
    console.log('Please make sure .env.local exists with the NextAuth configuration.')
    process.exit(1)
  }
  console.log('✅ Environment file found')

  // 2. Initialize JSON database with demo data
  console.log('🔄 Setting up JSON database...')
  execSync('node scripts/init-db.js', { stdio: 'inherit' })

  console.log('\n🎉 Setup complete!')
  console.log('\n📋 Next steps:')
  console.log('   1. Run: npm run dev')
  console.log('   2. Open: http://localhost:3000')
  console.log('   3. Sign in with demo accounts or create new ones')
  console.log('\n🔑 Demo accounts available:')
  console.log('   📧 demo@twitter.com (password: demo123)')
  console.log('   📧 john@example.com (password: john123)')
  console.log('   📧 jane@example.com (password: jane123)')
  console.log('\n💾 Database: Simple JSON file at /data/db.json')
  console.log('🔧 Reset: npm run db:reset (clears all data)')

} catch (error) {
  console.error('\n❌ Setup failed:', error.message)
  console.log('\n🔧 Try running manually:')
  console.log('   npm run db:init')
  process.exit(1)
}