import { ApifyClient } from 'apify-client'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN

const client = new ApifyClient({
  token: APIFY_TOKEN,
})

export interface ScrapedJob {
  title: string
  company: string
  location: string
  jobUrl: string
  description: string
  salaryMin?: number
  salaryMax?: string
  postedAt?: string
  source: 'linkedin' | 'indeed'
}

export async function scrapeLinkedInJobs(
  searchTerm: string,
  location?: string,
  limit = 20
): Promise<ScrapedJob[]> {
  if (!APIFY_TOKEN) {
    throw new Error('APIFY_API_TOKEN not configured')
  }

  try {
    const input = {
      keyword: searchTerm,
      location: location || 'Worldwide',
      limit: limit,
    }

    console.log('LinkedIn: Starting scrape...')

    const run = await client.actor('apify/linkedin-jobs-scraper').call(input) as any

    console.log('LinkedIn: Run ID:', run.id, 'Status:', run.status)

    if (!run.defaultDatasetId) {
      throw new Error('No data returned from LinkedIn')
    }

    const datasetClient = client.dataset(run.defaultDatasetId)
    const datasetResult = await datasetClient.listItems({ limit: 100 })
    const items = datasetResult.items || []

    console.log('LinkedIn: Found', items.length, 'jobs')

    if (items.length === 0) {
      throw new Error('No jobs found on LinkedIn')
    }

    return items.slice(0, limit).map((item: any) => ({
      title: item.title || item.position || '',
      company: item.companyName || item.company || '',
      location: item.location || item.jobLocation || '',
      jobUrl: item.url || item.link || item.jobUrl || '',
      description: item.description?.substring(0, 1000) || '',
      salaryMin: item.salaryMin || item.minSalary,
      salaryMax: item.salaryMax || item.maxSalary,
      postedAt: item.postedAt || item.dateAgo || item.published,
      source: 'linkedin' as const,
    }))
  } catch (error) {
    console.error('LinkedIn scrape error:', error)
    throw new Error(`LinkedIn scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function scrapeIndeedJobs(
  searchTerm: string,
  location?: string,
  limit = 20
): Promise<ScrapedJob[]> {
  if (!APIFY_TOKEN) {
    throw new Error('APIFY_API_TOKEN not configured')
  }

  try {
    const input = {
      search: searchTerm,
      location: location || 'Worldwide',
      maxResults: limit,
    }

    console.log('Indeed: Starting scrape...')

    const run = await client.actor('dropty/indeed-scraper').call(input) as any

    console.log('Indeed: Run ID:', run.id, 'Status:', run.status)

    if (!run.defaultDatasetId) {
      throw new Error('No data returned from Indeed')
    }

    const datasetClient = client.dataset(run.defaultDatasetId)
    const datasetResult = await datasetClient.listItems({ limit: 100 })
    const items = datasetResult.items || []

    console.log('Indeed: Found', items.length, 'jobs')

    if (items.length === 0) {
      throw new Error('No jobs found on Indeed')
    }

    return items.slice(0, limit).map((item: any) => ({
      title: item.title || '',
      company: item.company || item.companyName || '',
      location: item.location || item.jobLocation || '',
      jobUrl: item.url || item.link || '',
      description: item.description?.substring(0, 1000) || '',
      salaryMin: item.salary?.min || item.minSalary,
      salaryMax: item.salary?.max || item.maxSalary,
      postedAt: item.date || item.postedAt,
      source: 'indeed' as const,
    }))
  } catch (error) {
    console.error('Indeed scrape error:', error)
    throw new Error(`Indeed scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function scrapeJobs(
  searchTerm: string,
  location?: string,
  sources: ('linkedin' | 'indeed')[] = ['linkedin'],
  limitPerSource = 10
): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = []
  const errors: string[] = []

  for (const source of sources) {
    try {
      console.log(`Scraping ${source}...`)
      if (source === 'linkedin') {
        const jobs = await scrapeLinkedInJobs(searchTerm, location, limitPerSource)
        results.push(...jobs)
        console.log(`LinkedIn: Got ${jobs.length} jobs`)
      } else if (source === 'indeed') {
        const jobs = await scrapeIndeedJobs(searchTerm, location, limitPerSource)
        results.push(...jobs)
        console.log(`Indeed: Got ${jobs.length} jobs`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`${source}: ${message}`)
      console.error(`Error scraping ${source}:`, message)
    }
  }

  if (results.length === 0) {
    throw new Error(`No jobs found. Errors: ${errors.join('; ')}`)
  }

  return results
}
