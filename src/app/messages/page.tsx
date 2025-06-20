'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatTimeAgo } from '@/lib/utils'
import { Search, MoreHorizontal, Send, Plus } from 'lucide-react'

interface User {
  id: string
  name: string
  username: string
  image: string | null
  verified: boolean
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  user: User
  lastMessage: string
  lastMessageTime: string
  unread: boolean
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const userParam = searchParams.get('user')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)

        // If user param is provided, find and select that conversation
        if (userParam) {
          const targetConversation = data.conversations.find((conv: Conversation) =>
            conv.user.id === userParam
          )
          if (targetConversation) {
            setSelectedConversation(targetConversation)
            fetchMessages(targetConversation.id)
          } else {
            // Create new conversation with this user
            const userResponse = await fetch(`/api/users/${userParam}`)
            if (userResponse.ok) {
              const userData = await userResponse.json()
              const newConv: Conversation = {
                id: userParam, // Use direct user ID as conversation ID
                user: userData.user,
                lastMessage: '',
                lastMessageTime: new Date().toISOString(),
                unread: false,
              }
              setSelectedConversation(newConv)
              setMessages([])
              // Add the new conversation to the list
              setConversations(prev => [newConv, ...prev])
            }
          }
        } else if (data.conversations.length > 0) {
          setSelectedConversation(data.conversations[0])
          fetchMessages(data.conversations[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([]) // Set empty messages on error
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations()
    }
  }, [session, userParam])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !session?.user?.id || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedConversation.user.id,
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')

        // Update conversation list
        setConversations(prev => prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: data.message.content, lastMessageTime: data.message.createdAt }
            : conv
        ))

        // If this was a new conversation, refresh the conversation list
        if (selectedConversation.id.startsWith('new_')) {
          fetchConversations()
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleStartConversation = (user: User) => {
    setShowNewMessageModal(false)
    setSearchQuery('')
    setSearchResults([])
    router.push(`/messages?user=${user.id}`)
  }

  return (
    <MainLayout>
      <div className="flex h-screen">
        {/* Conversations List */}
        <div className="w-80 border-r border-border">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Messages</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewMessageModal(true)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search Direct Messages"
                className="pl-10 bg-muted border-0 rounded-full"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar src={conversation.user.image} alt={conversation.user.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(new Date(conversation.lastMessageTime || new Date().toISOString()))}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread && (
                        <div className="h-2 w-2 bg-accent rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-border p-4">
                <div className="flex items-center space-x-3">
                  <Avatar src={selectedConversation.user.image} alt={selectedConversation.user.name} />
                  <div>
                    <p className="font-bold">{selectedConversation.user.name}</p>
                    <p className="text-sm text-muted-foreground">@{selectedConversation.user.username}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === session?.user?.id
                          ? 'bg-accent text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === session?.user?.id ? 'text-blue-100' : 'text-muted-foreground'
                      }`}>
                        {formatTimeAgo(new Date(message.createdAt || new Date().toISOString()))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    placeholder="Start a new message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select a message</h2>
                <p className="text-muted-foreground">
                  Choose from your existing conversations, start a new one, or just keep swimming.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg w-full max-w-md mx-4">
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold">New Message</h2>
              </div>
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search users"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="mt-4 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleStartConversation(user)}
                        className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer rounded-lg"
                      >
                        <Avatar src={user.image} alt={user.name} />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <p className="text-center text-muted-foreground p-4">No users found</p>
                  ) : (
                    <p className="text-center text-muted-foreground p-4">Search for users to start a conversation</p>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowNewMessageModal(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
