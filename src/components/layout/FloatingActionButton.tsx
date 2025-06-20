'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PostComposer } from '@/components/tweet/TweetComposer'
import { Plus, X } from 'lucide-react'

export function FloatingActionButton() {
  const [isComposerOpen, setIsComposerOpen] = useState(false)

  const handlePostCreated = () => {
    setIsComposerOpen(false)
    // Optionally trigger feed refresh
    window.location.reload()
  }

  return (
    <>
      {/* Floating Action Button */}
      <Button
        variant="accent"
        size="icon"
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-2xl hover:shadow-accent/30 hover:scale-110 active:scale-95 transition-all duration-300"
        onClick={() => setIsComposerOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Mobile Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-primary-black/80 backdrop-blur-sm">
          <div className="flex flex-col h-full">
            {/* Modal Header */}
            <div className="glass-nav backdrop-blur-2xl border-b border-glass-border p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsComposerOpen(false)}
                  className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-bold text-foreground">New Post</h2>
                <div className="w-10" /> {/* Spacer */}
              </div>
            </div>

            {/* Composer Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <PostComposer 
                onPostCreated={handlePostCreated}
                placeholder="What's fresh today?"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}