import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const connection = await prisma.asanaConnection.findUnique({
      where: { userId: session.user.id },
    })

    if (!connection) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: true,
      workspaceName: connection.workspaceName,
    })
  } catch (error) {
    console.error('Error fetching Asana connection:', error)
    return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 })
  }
}
