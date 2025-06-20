import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { username } = await params

    // Find user by username
    const user = db.users.findByUsername(username)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user stats
    const stats = db.users.getStats(user.id)

    // Check if current user is following this user
    let isFollowing = false
    if (session?.user?.id && session.user.id !== user.id) {
      isFollowing = db.follows.isFollowing(session.user.id, user.id)
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        website: user.website,
        image: user.image,
        verified: user.verified,
        joinedAt: user.joined_at,
      },
      stats,
      isFollowing,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}