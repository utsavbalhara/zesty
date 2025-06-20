'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Search, Filter, IndianRupee } from 'lucide-react'

interface MarketplaceItem {
  id: string
  title: string
  description: string
  price?: number
  category: string
  condition?: string
  seller_id: string
  images?: string[]
  videos?: string[]
  status: string
  created_at: string
  seller?: {
    id: string
    name: string
    username: string
    image?: string
  }
}

export default function MarketplacePage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other']

  useEffect(() => {
    fetchItems()
  }, [selectedCategory])

  const fetchItems = async () => {
    try {
      const url = selectedCategory 
        ? `/api/marketplace?category=${selectedCategory}` 
        : '/api/marketplace'
      const response = await fetch(url)
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching marketplace items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!session) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <p>Please sign in to access the marketplace.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            List Item
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                {item.images && item.images.length > 0 && (
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="max-w-full max-h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  {item.price && (
                    <div className="flex items-center text-green-600 font-semibold">
                      <IndianRupee className="h-4 w-4" />
                      {item.price}
                    </div>
                  )}
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      {item.seller?.name || 'Unknown'}
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found.</p>
          </div>
        )}

        {/* Create Item Modal */}
        {showCreateForm && (
          <CreateItemModal 
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false)
              fetchItems()
            }}
          />
        )}
      </div>
    </MainLayout>
  )
}

function CreateItemModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'good'
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other']
  const conditions = ['new', 'like_new', 'good', 'fair', 'poor']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        console.error('Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">List New Item</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Item title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
          
          <Input
            type="number"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          />
          
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={formData.condition}
            onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            {conditions.map(cond => (
              <option key={cond} value={cond}>
                {cond.replace('_', ' ').charAt(0).toUpperCase() + cond.replace('_', ' ').slice(1)}
              </option>
            ))}
          </select>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}