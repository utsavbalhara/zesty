'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout'
import { PostComposer } from '@/components/tweet/TweetComposer'
import { PostFeed } from '@/components/tweet/TweetFeed'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-glass-border border-t-accent"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 border-4 border-accent/20"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading Zestyy...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left side - Hero */}
              <div className="space-y-8">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary-blue to-blue-light flex items-center justify-center shadow-2xl shadow-primary-blue/30">
                  <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-7xl font-bold bg-gradient-to-r from-white via-blue-light to-primary-blue bg-clip-text text-transparent leading-tight">
                    What's fresh today?
                  </h1>
                  <h2 className="text-4xl font-bold text-foreground">
                    Join <span className="bg-gradient-to-r from-primary-blue to-blue-light bg-clip-text text-transparent">Zestyy</span> today.
                  </h2>
                </div>

                <div className="space-y-6 max-w-sm">
                  <Link href="/auth/signup">
                    <Button variant="accent" size="lg" className="w-full text-lg font-bold shadow-2xl hover:shadow-primary-blue/30">
                      <span className="mr-2">✨</span>
                      Create account
                    </Button>
                  </Link>
                  
                  <div className="text-sm text-muted-foreground glass-card p-4 rounded-xl">
                    By signing up, you agree to the{' '}
                    <a href="#" className="text-accent hover:text-blue-light transition-colors">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-accent hover:text-blue-light transition-colors">Privacy Policy</a>.
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-lg font-bold mb-3 text-foreground">Already have an account?</p>
                    <Link href="/auth/signin">
                      <Button variant="outline" size="lg" className="w-full text-lg font-bold">
                        Sign in
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right side - Features */}
              <div className="space-y-8">
                <div className="glass-card rounded-3xl p-8 space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="h-12 w-12 rounded-2xl bg-accent-info flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Follow your interests</h3>
                      <p className="text-muted-foreground">
                        Discover content that matters to you in your college community.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="h-12 w-12 rounded-2xl bg-accent-success flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Connect with classmates</h3>
                      <p className="text-muted-foreground">
                        Build meaningful connections within your academic journey.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="h-12 w-12 rounded-2xl bg-accent-warning flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Share your journey</h3>
                      <p className="text-muted-foreground">
                        Express your thoughts and experiences with fellow students.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-2xl mx-auto min-h-screen">
        {/* Header - Hidden on mobile (handled by MobileHeader) */}
        <div className="hidden md:block sticky top-0 z-10 glass backdrop-blur-2xl border-b border-glass-border m-4 rounded-2xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-light to-primary-blue bg-clip-text text-transparent">
                Home Feed
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Composer - Hidden on mobile (handled by FloatingActionButton) */}
        <div className="hidden md:block">
          <PostComposer onPostCreated={handlePostCreated} />
        </div>

        {/* Post Feed */}
        <PostFeed refreshTrigger={refreshTrigger} />
        
        {/* Bottom spacer */}
        <div className="h-20 md:h-20"></div>
      </div>
    </ResponsiveLayout>
  )
}
