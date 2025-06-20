import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { receiverId, content } = await request.json()

    if (!receiverId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      )
    }

    // Check if receiver exists
    const receiver = db.users.findById(receiverId)
    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      )
    }

    // Create message
    const message = db.messages.create({
      sender_id: session.user.id,
      receiver_id: receiverId,
      content: content.trim(),
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}