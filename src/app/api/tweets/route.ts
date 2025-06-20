import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const tweets = db.tweets.getAll(limit)

    return NextResponse.json({
      tweets,
      nextCursor: null, // For simplicity, we're not implementing pagination with JSON DB
    })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, imageUrl } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet content is required' },
        { status: 400 }
      )
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Tweet content is too long' },
        { status: 400 }
      )
    }

    const tweet = db.tweets.create({
      content: content.trim(),
      image_url: imageUrl,
      author_id: session.user.id,
    })

    // Get the tweet with author info for response
    const tweetWithAuthor = db.tweets.getAll(1).find(t => t.id === tweet.id)

    return NextResponse.json(tweetWithAuthor)
  } catch (error) {
    console.error('Error creating tweet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}