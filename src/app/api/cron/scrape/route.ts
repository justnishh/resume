import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scrapeJobs } from '@/lib/services/apify'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        searchPreferences: {
          some: {},
        },
      },
      include: {
        searchPreferences: true,
      },
    })

    const results = []

    for (const user of users) {
      const prefs = user.searchPreferences[0]
      if (!prefs || prefs.jobRoles.length === 0) continue

      for (const role of prefs.jobRoles) {
        for (const location of prefs.locations) {
          const sources = prefs.sources as ('linkedin' | 'indeed')[]
          
          try {
            const scrapedJobs = await scrapeJobs(
              role,
              location,
              sources,
              10
            )

            for (const job of scrapedJobs) {
              const existingJob = await prisma.job.findFirst({
                where: {
                  userId: user.id,
                  jobUrl: job.jobUrl,
                },
              })

              if (!existingJob) {
                await prisma.job.create({
                  data: {
                    userId: user.id,
                    title: job.title,
                    company: job.company,
                    location: job.location || null,
                    jobUrl: job.jobUrl || null,
                    description: job.description || null,
                    salaryMin: job.salaryMin || null,
                    salaryMax: job.salaryMax ? parseInt(job.salaryMax) : null,
                    source: job.source === 'linkedin' ? 'linkedin' : 'indeed',
                    scrapedAt: new Date(),
                  },
                })
              }
            }

            results.push({
              userId: user.id,
              role,
              location,
              scraped: scrapedJobs.length,
              success: true,
            })
          } catch (error) {
            console.error(`Error scraping for user ${user.id}:`, error)
            results.push({
              userId: user.id,
              role,
              location,
              error: 'Scraping failed',
              success: false,
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
