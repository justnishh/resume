'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Package, Truck, MapPin } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  menuItem: {
    name: string
  }
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

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'delivered', label: 'Delivered', icon: Truck },
]

export default function OrderPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
        }
      } catch (error) {
        console.error('Failed to fetch order')
      }
      setLoading(false)
    }
    if (params.id) fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Order not found</p>
          <Link href="/" className="text-primary hover:underline">Go Home</Link>
        </div>
      </div>
    )
  }

  const currentStep = statusSteps.findIndex(s => s.key === order.status)

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-heading font-bold">Order Confirmed!</h1>
          <p className="text-muted mt-2">Order #{order.id.slice(-6).toUpperCase()}</p>
        </div>

        <div className="bg-surface rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-heading font-semibold mb-4">Order Status</h2>
          <div className="flex justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index <= currentStep
              const isCurrent = index === currentStep
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-primary text-white' : 'bg-border text-muted'
                  } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-primary font-medium' : 'text-muted'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-heading font-semibold mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted">Name:</span> {order.customerName}</p>
            <p><span className="text-muted">Phone:</span> {order.customerPhone}</p>
            <p><span className="text-muted">Type:</span> {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</p>
            {order.orderType === 'delivery' && order.customerAddress && (
              <p><span className="text-muted">Address:</span> {order.customerAddress}</p>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-heading font-semibold mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.menuItem.name} x {item.quantity}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">${order.total.toFixed(2)}</span>
          </div>
        </div>

        <Link 
          href="/menu"
          className="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Order More
        </Link>
      </div>
    </div>
  )
}