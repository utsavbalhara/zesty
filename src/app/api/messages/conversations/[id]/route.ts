import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: conversationId } = await params
    
    // Extract partner ID from conversation ID
    let partnerId: string
    
    if (conversationId.startsWith('new_')) {
      // New conversation format: new_partnerId
      partnerId = conversationId.replace('new_', '')
    } else {
      // Direct partner ID (simplified approach)
      partnerId = conversationId
    }
    
    // Get messages between current user and partner
    const messages = db.messages.getConversationMessages(session.user.id, partnerId)
    
    // Mark messages as read
    db.messages.markAsRead(session.user.id, partnerId)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching conversation messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}