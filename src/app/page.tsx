'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { TweetComposer } from '@/components/tweet/TweetComposer'
import { TweetFeed } from '@/components/tweet/TweetFeed'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTweetCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Hero */}
              <div className="space-y-8">
                <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                  <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-6xl font-bold">
                    Happening now
                  </h1>
                  <h2 className="text-3xl font-bold">
                    Join Twitter today.
                  </h2>
                </div>

                <div className="space-y-4 max-w-sm">
                  <Link href="/auth/signup">
                    <Button className="w-full h-12 text-lg font-bold">
                      Create account
                    </Button>
                  </Link>
                  
                  <div className="text-sm text-muted-foreground">
                    By signing up, you agree to the{' '}
                    <a href="#" className="text-accent hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-lg font-bold mb-3">Already have an account?</p>
                    <Link href="/auth/signin">
                      <Button variant="outline" className="w-full h-12 text-lg font-bold">
                        Sign in
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right side - Features */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Follow your interests</h3>
                      <p className="text-muted-foreground">
                        Hear about what matters to you.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Hear what people are talking about</h3>
                      <p className="text-muted-foreground">
                        Join the conversation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Join the conversation</h3>
                      <p className="text-muted-foreground">
                        Tweet your thoughts.
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
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <h1 className="text-xl font-bold">Home</h1>
        </div>

        {/* Tweet Composer */}
        <TweetComposer onTweetCreated={handleTweetCreated} />

        {/* Tweet Feed */}
        <TweetFeed refreshTrigger={refreshTrigger} />
      </div>
    </MainLayout>
  )
}
