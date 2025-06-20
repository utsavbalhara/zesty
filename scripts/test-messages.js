const fs = require('fs')
const path = require('path')

function testMessages() {
  const dbPath = path.join(process.cwd(), 'data', 'db.json')
  
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file not found. Run npm run setup first.')
    return
  }

  try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    
    console.log('📊 Database Status:')
    console.log(`   Users: ${data.users?.length || 0}`)
    console.log(`   Messages: ${data.messages?.length || 0}`)
    console.log(`   Notifications: ${data.notifications?.length || 0}`)
    
    if (data.messages && data.messages.length > 0) {
      console.log('\n💬 Sample Messages:')
      data.messages.slice(0, 3).forEach((msg, i) => {
        const sender = data.users.find(u => u.id === msg.senderId)
        const receiver = data.users.find(u => u.id === msg.receiverId)
        console.log(`   ${i + 1}. ${sender?.name} → ${receiver?.name}: "${msg.content}"`)
      })
    }
    
    if (data.users && data.users.length > 0) {
      console.log('\n👥 Demo Users:')
      data.users.forEach(user => {
        console.log(`   📧 ${user.email} (${user.name})`)
      })
    }
    
    console.log('\n✅ Database looks good! Try the messaging features.')
    
  } catch (error) {
    console.error('❌ Error reading database:', error)
  }
}

testMessages()