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

const ACTOR_IDS = {
  linkedin: 'preruntime/linkedin-jobs-scraper',
  indeed: 'dropty/indeed-scraper',
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
      searchTerms: [searchTerm],
      location: location || 'Worldwide',
      maxResults: limit,
    }

    console.log('LinkedIn scraper: Starting with input:', JSON.stringify(input))

    const run = await client.actor(ACTOR_IDS.linkedin).call(input) as any

    console.log('LinkedIn scraper: Run status:', run.status, 'Dataset ID:', run.defaultDatasetId)

    if (!run.defaultDatasetId) {
      throw new Error('No dataset returned from LinkedIn scraper')
    }

    const datasetClient = client.dataset(run.defaultDatasetId)
    const datasetResult = await datasetClient.listItems({ limit: 100 })
    const items = datasetResult.items || []

    console.log('LinkedIn scraper: Got', items.length, 'items')

    if (items.length === 0) {
      throw new Error('No jobs found for this search')
    }

    return items.slice(0, limit).map((item: any) => ({
      title: item.title || '',
      company: item.companyName || item.company || '',
      location: item.location || '',
      jobUrl: item.url || item.link || '',
      description: item.description?.substring(0, 1000) || '',
      salaryMin: item.salary?.min || item.salaryMin,
      salaryMax: item.salary?.max || item.salaryMax,
      postedAt: item.postedAt || item.date,
      source: 'linkedin' as const,
    }))
  } catch (error) {
    console.error('LinkedIn scraper error:', error)
    throw error
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
      searchTerm,
      location: location || 'Worldwide',
      maxResults: limit,
    }

    console.log('Indeed scraper: Starting with input:', JSON.stringify(input))

    const run = await client.actor(ACTOR_IDS.indeed).call(input) as any

    console.log('Indeed scraper: Run status:', run.status, 'Dataset ID:', run.defaultDatasetId)

    if (!run.defaultDatasetId) {
      throw new Error('No dataset returned from Indeed scraper')
    }

    const datasetClient = client.dataset(run.defaultDatasetId)
    const datasetResult = await datasetClient.listItems({ limit: 100 })
    const items = datasetResult.items || []

    console.log('Indeed scraper: Got', items.length, 'items')

    if (items.length === 0) {
      throw new Error('No jobs found for this search')
    }

    return items.slice(0, limit).map((item: any) => ({
      title: item.title || '',
      company: item.company || '',
      location: item.location || '',
      jobUrl: item.url || item.link || '',
      description: item.description?.substring(0, 1000) || '',
      salaryMin: item.salary?.min,
      salaryMax: item.salary?.max,
      postedAt: item.date,
      source: 'indeed' as const,
    }))
  } catch (error) {
    console.error('Indeed scraper error:', error)
    throw error
  }
}

export async function scrapeJobs(
  searchTerm: string,
  location?: string,
  sources: ('linkedin' | 'indeed')[] = ['linkedin', 'indeed'],
  limitPerSource = 10
): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = []
  const errors: string[] = []

  for (const source of sources) {
    try {
      if (source === 'linkedin') {
        const jobs = await scrapeLinkedInJobs(searchTerm, location, limitPerSource)
        results.push(...jobs)
      } else if (source === 'indeed') {
        const jobs = await scrapeIndeedJobs(searchTerm, location, limitPerSource)
        results.push(...jobs)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`${source}: ${message}`)
      console.error(`Error scraping ${source}:`, message)
    }
  }

  if (results.length === 0) {
    throw new Error(`No jobs found. Errors: ${errors.join(', ')}`)
  }

  return results
}
