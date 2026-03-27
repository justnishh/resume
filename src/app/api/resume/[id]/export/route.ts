import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { formatResumeForMarkdown } from '@/lib/services/resume'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'markdown'
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    if (format === 'markdown') {
      const markdown = formatResumeForMarkdown(resume.data as any)
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${resume.versionName}.md"`,
        },
      })
    }

    if (format === 'json') {
      return NextResponse.json(resume.data, {
        headers: {
          'Content-Disposition': `attachment; filename="${resume.versionName}.json"`,
        },
      })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting resume:', error)
    return NextResponse.json({ error: 'Failed to export resume' }, { status: 500 })
  }
}
