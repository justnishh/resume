'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

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

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', image: '', categoryId: '', available: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [itemsRes, catsRes] = await Promise.all([
      fetch('/api/menu-items'),
      fetch('/api/categories')
    ])
    const itemsData = await itemsRes.json()
    const catsData = await catsRes.json()
    setItems(itemsData.items || [])
    setCategories(catsData.categories || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items'
    const method = editingItem ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) })
    })
    
    setShowModal(false)
    setEditingItem(null)
    setForm({ name: '', description: '', price: '', image: '', categoryId: '', available: true })
    fetchData()
  }

  async function toggleAvailability(item: MenuItem) {
    await fetch(`/api/menu-items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !item.available })
    })
    fetchData()
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/menu-items/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold">Menu Items</h1>
        <button 
          onClick={() => { setShowModal(true); setEditingItem(null); setForm({ name: '', description: '', price: '', image: '', categoryId: categories[0]?.id || '', available: true }) }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input 
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-surface rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-40">
              <Image 
                src={item.image || 'https://picsum.photos/seed/food/400/300'} 
                alt={item.name}
                fill
                className="object-cover"
              />
              {!item.available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">Unavailable</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{item.name}</h3>
              <p className="text-sm text-muted line-clamp-2 mb-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold">${item.price.toFixed(2)}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingItem(item); setForm({ name: item.name, description: item.description || '', price: item.price.toString(), image: item.image || '', categoryId: item.categoryId, available: item.available }); setShowModal(true) }}
                    className="p-2 hover:bg-background rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-2 hover:bg-background rounded-lg text-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => toggleAvailability(item)}
                className={`mt-3 w-full py-1 rounded text-sm ${item.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
              >
                {item.available ? 'Available' : 'Mark Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-heading font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Menu Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({...form, price: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input 
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({...form, image: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={form.categoryId}
                  onChange={(e) => setForm({...form, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({...form, available: e.target.checked})}
                />
                <span>Available</span>
              </label>
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-border py-2 rounded-lg hover:bg-background"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}