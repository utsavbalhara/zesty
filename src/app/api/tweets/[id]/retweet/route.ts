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

    const { id: tweetId } = await params
    const userId = session.user.id

    // Check if tweet exists
    const tweet = db.tweets.findById(tweetId)

    if (!tweet) {
      return NextResponse.json(
        { error: 'Tweet not found' },
        { status: 404 }
      )
    }

    // Toggle retweet
    const result = db.retweets.toggle(userId, tweetId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error toggling retweet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}