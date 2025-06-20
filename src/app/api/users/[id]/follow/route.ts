import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
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

    const { id: followingId } = await params
    const followerId = session.user.id

    if (followerId === followingId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if user exists
    const userToFollow = db.users.findById(followingId)

    if (!userToFollow) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Toggle follow
    const result = db.follows.toggle(followerId, followingId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error toggling follow:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}