import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password } = await request.json()

    // Validate input
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserByEmail = db.users.findByEmail(email.trim().toLowerCase())
    const existingUserByUsername = db.users.findByUsername(username.trim().toLowerCase())

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Create user (for demo purposes, we're not hashing passwords)
    // In production, hash the password: const hashedPassword = await bcrypt.hash(password, 12)
    const user = db.users.create({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      verified: false,
      // In production, store hashedPassword
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user. Please try again.' },
      { status: 500 }
    )
  }
}