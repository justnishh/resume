'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    orderType: 'pickup'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      alert('Please fill in required fields')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: form.address,
          orderType: form.orderType,
          items: items.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        clearCart()
        router.push(`/order/${data.order.id}`)
      } else {
        alert('Failed to place order')
      }
    } catch (error) {
      alert('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Your cart is empty</p>
          <a href="/menu" className="text-primary hover:underline">Browse Menu</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input 
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input 
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Order Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="orderType" 
                      value="pickup"
                      checked={form.orderType === 'pickup'}
                      onChange={(e) => setForm({...form, orderType: e.target.value})}
                      className="text-primary"
                    />
                    <span>Pickup</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="orderType" 
                      value="delivery"
                      checked={form.orderType === 'delivery'}
                      onChange={(e) => setForm({...form, orderType: e.target.value})}
                      className="text-primary"
                    />
                    <span>Delivery</span>
                  </label>
                </div>
              </div>

              {form.orderType === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Address</label>
                  <textarea 
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                    rows={3}
                    placeholder="Your delivery address"
                  />
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-sm h-fit">
            <h2 className="font-heading font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <Image 
                    src={item.image} 
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}