'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
    const method = editingCategory ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    
    setShowModal(false)
    setEditingCategory(null)
    setName('')
    fetchCategories()
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? This will also delete all menu items in it.')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    fetchCategories()
  }

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
        <h1 className="text-2xl font-heading font-bold">Categories</h1>
        <button 
          onClick={() => { setShowModal(true); setEditingCategory(null); setName('') }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-background">
            <tr>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Slug</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-background">
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-muted">{cat.slug}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingCategory(cat); setName(cat.name); setShowModal(true) }}
                      className="p-2 hover:bg-background rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteCategory(cat.id)}
                      className="p-2 hover:bg-background rounded-lg text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-heading font-semibold mb-4">{editingCategory ? 'Edit' : 'Add'} Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Category name"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
                >
                  {editingCategory ? 'Update' : 'Add'}
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