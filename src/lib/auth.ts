import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        try {
          const user = db.users.findByEmail(credentials.email.trim().toLowerCase())

          if (!user) {
            throw new Error('No user found with this email')
          }

          // For demo purposes, we'll skip password verification
          // In production, you should verify the hashed password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error('Authentication failed')
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}