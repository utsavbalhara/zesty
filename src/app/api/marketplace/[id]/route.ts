import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { statements } from '@/lib/sqlite'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = statements.findMarketplaceItemById.get(id)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
      videos: item.videos ? JSON.parse(item.videos) : []
    })
  } catch (error) {
    console.error('Error fetching marketplace item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const { id } = await params
    const item = statements.findMarketplaceItemById.get(id)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (item.seller_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only edit your own items' },
        { status: 403 }
      )
    }

    const { title, description, price, category, condition, images, videos, status } = await request.json()

    statements.updateMarketplaceItem.run(
      title || item.title,
      description || item.description,
      price !== undefined ? price : item.price,
      category || item.category,
      condition || item.condition,
      images ? JSON.stringify(images) : item.images,
      videos ? JSON.stringify(videos) : item.videos,
      status || item.status,
      id
    )

    const updatedItem = statements.findMarketplaceItemById.get(id)
    
    return NextResponse.json({
      ...updatedItem,
      images: updatedItem.images ? JSON.parse(updatedItem.images) : [],
      videos: updatedItem.videos ? JSON.parse(updatedItem.videos) : []
    })
  } catch (error) {
    console.error('Error updating marketplace item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const { id } = await params
    const item = statements.findMarketplaceItemById.get(id)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (item.seller_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only delete your own items' },
        { status: 403 }
      )
    }

    statements.deleteMarketplaceItem.run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting marketplace item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}