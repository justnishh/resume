'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react'

interface Stats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  completedOrders: number
}

interface Order {
  id: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ todayOrders: 0, todayRevenue: 0, pendingOrders: 0, completedOrders: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes] = await Promise.all([
          fetch('/api/orders')
        ])
        const data = await ordersRes.json()
        const orders = data.orders || []
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayOrders = orders.filter((o: Order) => new Date(o.createdAt) >= today)
        
        setStats({
          todayOrders: todayOrders.length,
          todayRevenue: todayOrders.reduce((sum: number, o: Order) => sum + o.total, 0),
          pendingOrders: orders.filter((o: Order) => o.status === 'pending').length,
          completedOrders: orders.filter((o: Order) => o.status === 'delivered').length
        })
        
        setRecentOrders(orders.slice(0, 10))
      } catch (error) {
        console.error('Failed to fetch data')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: Package, color: 'bg-blue-500' },
    { label: "Today's Revenue", value: `$${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'bg-accent' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-surface p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-muted text-sm">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-surface rounded-xl shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-heading font-semibold text-lg">Recent Orders</h2>
          <Link href="/admin/orders" className="text-primary hover:underline text-sm">View All</Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-muted">No orders yet</div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-background">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'pending' ? 'bg-warning/20 text-yellow-700' :
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'ready' ? 'bg-accent/20 text-accent' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}