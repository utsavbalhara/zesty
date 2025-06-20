import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { statements, generateId } from '@/lib/sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')

    let items
    if (category) {
      // Filter by category if provided
      const db = await import('@/lib/sqlite').then(m => m.getDatabase())
      items = db.prepare(`
        SELECT 
          m.*,
          u.name as seller_name,
          u.username as seller_username,
          u.image as seller_image
        FROM marketplace m
        JOIN users u ON m.seller_id = u.id
        WHERE m.status = 'available' AND m.category = ?
        ORDER BY m.created_at DESC
        LIMIT ?
      `).all(category, limit)
    } else {
      items = statements.getMarketplaceItems.all(limit)
    }

    // Parse JSON fields
    const processedItems = items.map((item: Record<string, unknown>) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
      videos: item.videos ? JSON.parse(item.videos) : []
    }))

    return NextResponse.json({ items: processedItems })
  } catch (error) {
    console.error('Error fetching marketplace items:', error)
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

    const { title, description, price, category, condition, images, videos } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    const id = generateId()
    
    statements.createMarketplaceItem.run(
      id,
      title.trim(),
      description.trim(),
      price || null,
      category.trim(),
      condition || 'good',
      session.user.id,
      images ? JSON.stringify(images) : null,
      videos ? JSON.stringify(videos) : null,
      'available'
    )

    // Get the created item with seller info
    const createdItem = statements.findMarketplaceItemById.get(id)

    return NextResponse.json({
      ...createdItem,
      images: createdItem.images ? JSON.parse(createdItem.images) : [],
      videos: createdItem.videos ? JSON.parse(createdItem.videos) : []
    })
  } catch (error) {
    console.error('Error creating marketplace item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}