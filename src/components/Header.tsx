'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'
import CartSidebar from './CartSidebar'

export default function Header() {
  const { itemCount, setIsOpen } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍕</span>
              <span className="text-2xl font-heading font-bold text-primary">Foodie</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-secondary hover:text-primary transition-colors font-medium">Home</Link>
              <Link href="/menu" className="text-secondary hover:text-primary transition-colors font-medium">Menu</Link>
              <Link href="/menu#about" className="text-secondary hover:text-primary transition-colors font-medium">About</Link>
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsOpen(true)}
                className="relative p-2 hover:bg-background rounded-full transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-secondary" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </button>

              <Link 
                href="/admin" 
                className="hidden md:block text-muted hover:text-primary transition-colors text-sm font-medium"
              >
                Admin
              </Link>

              <button 
                className="md:hidden p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <Link href="/" className="text-secondary hover:text-primary font-medium" onClick={() => setMobileOpen(false)}>Home</Link>
                <Link href="/menu" className="text-secondary hover:text-primary font-medium" onClick={() => setMobileOpen(false)}>Menu</Link>
                <Link href="/menu#about" className="text-secondary hover:text-primary font-medium" onClick={() => setMobileOpen(false)}>About</Link>
                <Link href="/admin" className="text-muted hover:text-primary font-medium" onClick={() => setMobileOpen(false)}>Admin</Link>
              </div>
            </nav>
          )}
        </div>
      </header>
      <CartSidebar />
    </>
  )
}