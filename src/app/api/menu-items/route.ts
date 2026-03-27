import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    
    const where = categoryId ? { categoryId } : {}
    
    const items = await prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, image, categoryId, available } = body
    
    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        categoryId,
        available: available ?? true
      }
    })
    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}