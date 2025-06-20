import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { statements } from '@/lib/sqlite'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const degree = searchParams.get('degree')
    const branch = searchParams.get('branch')
    const section = searchParams.get('section')
    const hostel = searchParams.get('hostel')

    // Validate section is a number if provided
    const sectionNumber = section ? parseInt(section) : null
    if (section && isNaN(sectionNumber)) {
      return NextResponse.json(
        { error: 'Section must be a number' },
        { status: 400 }
      )
    }

    // Validate branch and degree are uppercase if provided
    const normalizedBranch = branch ? branch.toUpperCase() : null
    const normalizedDegree = degree ? degree.toUpperCase() : null

    const users = statements.getUsersByFilter.all(
      normalizedDegree, normalizedDegree,
      normalizedBranch, normalizedBranch,
      sectionNumber, sectionNumber,
      hostel, hostel
    )

    // Remove sensitive information
    const sanitizedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      verified: Boolean(user.verified),
      degree: user.degree,
      branch: user.branch,
      section: user.section,
      hostel: user.hostel,
      bio: user.bio,
      location: user.location,
      website: user.website,
      joined_at: user.joined_at
    }))

    return NextResponse.json({ users: sanitizedUsers })
  } catch (error) {
    console.error('Error filtering users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}