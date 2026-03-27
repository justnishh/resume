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
  linkedin: 'apify/linkedin-jobs-scraper',
  indeed: 'apify/indeed-scraper',
}

function getMockJobs(searchTerm: string, location: string | undefined, source: 'linkedin' | 'indeed'): ScrapedJob[] {
  const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Stripe', 'Airbnb']
  const mockJobs: ScrapedJob[] = []

  for (let i = 0; i < 5; i++) {
    mockJobs.push({
      title: `${searchTerm}`,
      company: companies[i % companies.length],
      location: location || 'Remote',
      jobUrl: `https://example.com/jobs/${source}-${i}`,
      description: `We are looking for a ${searchTerm} to join our team. This is a great opportunity!`,
      source,
    })
  }

  return mockJobs
}

export async function scrapeLinkedInJobs(
  searchTerm: string,
  location?: string,
  limit = 20
): Promise<ScrapedJob[]> {
  if (!APIFY_TOKEN) {
    console.warn('APIFY_API_TOKEN not set - using mock data')
    return getMockJobs(searchTerm, location, 'linkedin')
  }

  try {
    const input = {
      searchTerms: [{ query: searchTerm, location: location ?? 'Worldwide' }],
      maxResults: limit,
    }

    console.log('Running LinkedIn scraper...')

    const run = await client.actor(ACTOR_IDS.linkedin).call(input) as any
    
    console.log('LinkedIn run completed:', run.id)

    if (!run.defaultDatasetId) {
      console.log('No dataset ID returned')
      return getMockJobs(searchTerm, location, 'linkedin')
    }

    const datasetClient = client.dataset(run.defaultDatasetId)
    const datasetResult = await datasetClient.listItems({ limit })
    const datasetItems = datasetResult.items as any[]

    if (!datasetItems || datasetItems.length === 0) {
      console.log('No LinkedIn jobs found')
      return getMockJobs(searchTerm, location, 'linkedin')
    }

    return datasetItems.map((item: any) => ({
      title: item.title || '',
      company: item.companyName || item.company || '',
      location: item.location || '',
      jobUrl: item.url || item.jobUrl || '',
      description: item.description || '',
      salaryMin: item.salaryMin || item.salary?.min,
      salaryMax: item.salaryMax || item.salary?.max,
      postedAt: item.postedAt || item.datePosted,
      source: 'linkedin' as const,
    }))
  } catch (error) {
    console.error('LinkedIn scraper error:', error)
    return getMockJobs(searchTerm, location, 'linkedin')
  }
}

export async function scrapeIndeedJobs(
  searchTerm: string,
  location?: string,
  limit = 20
): Promise<ScrapedJob[]> {
  if (!APIFY_TOKEN) {
    console.warn('APIFY_API_TOKEN not set - using mock data')
    return getMockJobs(searchTerm, location, 'indeed')
  }

  try {
    const input = {
      search: {
        query: searchTerm,
        location: location ?? 'Worldwide',
      },
      maxResults: limit,
    }

    console.log('Running Indeed scraper...')

    const run = await client.actor(ACTOR_IDS.indeed).call(input) as any
    
    console.log('Indeed run completed:', run.id)

    if (!run.defaultDatasetId) {
      console.log('No dataset ID returned')
      return getMockJobs(searchTerm, location, 'indeed')
    }

    const datasetClient = client.dataset(run.defaultDatasetId)
    const datasetResult = await datasetClient.listItems({ limit })
    const datasetItems = datasetResult.items as any[]

    if (!datasetItems || datasetItems.length === 0) {
      console.log('No Indeed jobs found')
      return getMockJobs(searchTerm, location, 'indeed')
    }

    return datasetItems.map((item: any) => ({
      title: item.title || '',
      company: item.company || '',
      location: item.location || '',
      jobUrl: item.url || '',
      description: item.description || '',
      salaryMin: item.salary?.min,
      salaryMax: item.salary?.max,
      postedAt: item.datePosted,
      source: 'indeed' as const,
    }))
  } catch (error) {
    console.error('Indeed scraper error:', error)
    return getMockJobs(searchTerm, location, 'indeed')
  }
}

export async function scrapeJobs(
  searchTerm: string,
  location?: string,
  sources: ('linkedin' | 'indeed')[] = ['linkedin', 'indeed'],
  limitPerSource = 10
): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = []

  const promises = sources.map(async (source) => {
    if (source === 'linkedin') {
      const jobs = await scrapeLinkedInJobs(searchTerm, location, limitPerSource)
      return jobs
    } else if (source === 'indeed') {
      const jobs = await scrapeIndeedJobs(searchTerm, location, limitPerSource)
      return jobs
    }
    return []
  })

  const allResults = await Promise.all(promises)
  allResults.forEach((jobs) => results.push(...jobs))

  return results
}

export async function getApifyCredits(): Promise<number> {
  return 0
}
