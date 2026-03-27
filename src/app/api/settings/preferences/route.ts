import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const preferencesSchema = z.object({
  jobRoles: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  sources: z.array(z.enum(['linkedin', 'indeed'])).default(['linkedin', 'indeed']),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const preferences = await prisma.searchPreference.findFirst({
      where: { userId: session.user.id },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = preferencesSchema.parse(body)

    const existingPreferences = await prisma.searchPreference.findFirst({
      where: { userId: session.user.id },
    })

    let preferences

    if (existingPreferences) {
      preferences = await prisma.searchPreference.update({
        where: { id: existingPreferences.id },
        data: validatedData,
      })
    } else {
      preferences = await prisma.searchPreference.create({
        data: {
          userId: session.user.id,
          ...validatedData,
        },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
