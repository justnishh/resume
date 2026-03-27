import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const resumeSchema = z.object({
  versionName: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
  data: z.any(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        experience: { orderBy: { order: 'asc' } },
        education: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json(resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = resumeSchema.parse(body)

    if (validatedData.isDefault) {
      await prisma.resume.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        versionName: validatedData.versionName,
        isDefault: validatedData.isDefault,
        data: validatedData.data,
      },
    })

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    console.error('Error creating resume:', error)
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 })
  }
}
