'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { useCart, CartItem } from '@/context/CartContext'

interface Category {
  id: string
  name: string
  slug: string
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  available: boolean
  categoryId: string
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category')
    if (cat) setActiveCategory(cat)
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [catRes, itemsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/menu-items')
      ])
      const catData = await catRes.json()
      const itemsData = await itemsRes.json()
      setCategories(catData.categories || [])
      setItems(itemsData.items || [])
      if (catData.categories?.length > 0 && !activeCategory) {
        setActiveCategory(catData.categories[0].slug)
      }
      setLoading(false)
    }
    fetchData()
  }, [activeCategory])

  const filteredItems = items.filter(item => {
    const matchesCategory = !activeCategory || activeCategory === 'all' || item.categoryId === categories.find(c => c.slug === activeCategory)?.id
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categoryItems = filteredItems.filter(item => 
    activeCategory === 'all' || item.categoryId === categories.find(c => c.slug === activeCategory)?.id
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-white mb-4">Our Menu</h1>
          <p className="text-white/80">Discover our delicious selection of dishes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input 
                  type="text"
                  placeholder="Search menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <h3 className="font-heading font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === 'all' ? 'bg-primary text-white' : 'hover:bg-surface'
                  }`}
                >
                  All Items
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeCategory === cat.slug ? 'bg-primary text-white' : 'hover:bg-surface'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryItems.filter(item => item.available).map(item => (
                <div key={item.id} className="bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image 
                      src={item.image || 'https://picsum.photos/seed/food/400/300'} 
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-muted text-sm line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-xl">${item.price.toFixed(2)}</span>
                      <button 
                        onClick={() => addItem({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image || 'https://picsum.photos/seed/food/400/300'
                        })}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {categoryItems.filter(item => item.available).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted">No items found</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}