import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { scrapeJobs } from '@/lib/services/apify'
import { z } from 'zod'

const scrapeSchema = z.object({
  searchTerm: z.string().min(1),
  location: z.string().optional(),
  sources: z.array(z.enum(['linkedin', 'indeed'])).default(['linkedin']),
  limitPerSource: z.number().min(1).max(50).default(10),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { searchTerm, location, sources, limitPerSource } = scrapeSchema.parse(body)

    console.log('Scraping jobs:', { searchTerm, location, sources, limitPerSource })

    const scrapedJobs = await scrapeJobs(searchTerm, location, sources, limitPerSource)

    console.log('Found', scrapedJobs.length, 'jobs')

    const savedJobs = await Promise.all(
      scrapedJobs.map(async (job) => {
        const existingJob = await prisma.job.findFirst({
          where: {
            userId: session.user.id,
            jobUrl: job.jobUrl,
          },
        })

        if (existingJob) {
          return existingJob
        }

        return prisma.job.create({
          data: {
            userId: session.user.id,
            title: job.title,
            company: job.company,
            location: job.location || null,
            jobUrl: job.jobUrl || null,
            description: job.description || null,
            salaryMin: job.salaryMin || null,
            salaryMax: job.salaryMax ? parseInt(String(job.salaryMax)) : null,
            source: job.source === 'linkedin' ? 'linkedin' : 'indeed',
            scrapedAt: new Date(),
          },
        })
      })
    )

    return NextResponse.json({
      scraped: scrapedJobs.length,
      saved: savedJobs.length,
      jobs: savedJobs,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Scraping error:', message)
    return NextResponse.json({ 
      error: 'Failed to scrape jobs',
      details: message,
      hint: 'Check that your Apify token is valid and you have credits available'
    }, { status: 500 })
  }
}
