'use client'

import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, clearCart } = useCart()

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-surface z-50 shadow-xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-heading font-semibold">Your Cart</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-background rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted mb-4">Your cart is empty</p>
              <Link 
                href="/menu" 
                onClick={() => setIsOpen(false)}
                className="text-primary hover:underline"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-background rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary">{item.name}</h4>
                    <p className="text-primary font-semibold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-danger hover:text-danger/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex justify-between mb-4">
              <span className="text-muted">Subtotal</span>
              <span className="text-xl font-semibold">${total.toFixed(2)}</span>
            </div>
            <Link 
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-primary text-white text-center py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Checkout
            </Link>
            <button 
              onClick={clearCart}
              className="block w-full mt-2 text-center text-muted hover:text-danger text-sm"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}