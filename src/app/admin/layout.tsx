'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Utensils, Tag, Settings } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/menu', icon: Utensils, label: 'Menu' },
  { href: '/admin/categories', icon: Tag, label: 'Categories' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-surface border-r border-border p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🍕</span>
          <span className="text-xl font-heading font-bold text-primary">Foodie</span>
        </Link>
        
        <nav className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-muted hover:bg-background hover:text-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <Link 
          href="/" 
          className="mt-8 flex items-center gap-3 px-4 py-3 text-muted hover:text-secondary"
        >
          <span className="text-sm">← Back to Site</span>
        </Link>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}