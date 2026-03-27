'use client'

import { useState, useEffect } from 'react'
import { X, Check, Clock, Package, Truck } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  menuItem: { name: string }
}

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string | null
  orderType: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
}

const statusOptions = ['pending', 'preparing', 'ready', 'delivered']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  async function fetchOrders() {
    setLoading(true)
    const url = filter !== 'all' ? `/api/orders?status=${filter}` : '/api/orders'
    const res = await fetch(url)
    const data = await res.json()
    setOrders(data.orders || [])
    setLoading(false)
  }

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchOrders()
    setSelectedOrder(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'preparing': return <Package className="w-4 h-4" />
      case 'ready': return <Check className="w-4 h-4" />
      case 'delivered': return <Truck className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold">Orders</h1>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg"
        >
          <option value="all">All Orders</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted">No orders found</div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="text-left p-4 font-medium">Order ID</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-background">
                  <td className="p-4 text-sm">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="p-4">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted">{order.customerPhone}</p>
                  </td>
                  <td className="p-4 capitalize">{order.orderType}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-warning/20 text-yellow-700' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'ready' ? 'bg-accent/20 text-accent' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium">${order.total.toFixed(2)}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted">Customer</span>
                <span className="font-medium">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Phone</span>
                <span>{selectedOrder.customerPhone}</span>
              </div>
              {selectedOrder.customerAddress && (
                <div className="flex justify-between">
                  <span className="text-muted">Address</span>
                  <span>{selectedOrder.customerAddress}</span>
                </div>
              )}
              <div className="border-t border-border pt-4">
                <p className="font-medium mb-2">Items</p>
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.menuItem.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-4">
                <span>Total</span>
                <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
              </div>

              <div className="border-t border-border pt-4">
                <p className="font-medium mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder.id, status)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedOrder.status === status 
                          ? 'bg-primary text-white' 
                          : 'bg-background hover:bg-primary/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}