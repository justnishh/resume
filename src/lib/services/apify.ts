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

export async function scrapeLinkedInJobs(
  searchTerm: string,
  location?: string,
  limit = 20
): Promise<ScrapedJob[]> {
  try {
    const input = {
      searchTerms: [{ query: searchTerm, location: location ?? 'Worldwide' }],
      maxResults: limit,
      parseCompanyDetails: true,
    }

    const run = await client.actor(ACTOR_IDS.linkedin).call(input)
    
    const output = run as any
    if (!output?.items || !Array.isArray(output.items)) {
      return []
    }

    return output.items.map((item: any) => ({
      title: item.title || '',
      company: item.companyName || '',
      location: item.location || '',
      jobUrl: item.url || '',
      description: item.description || '',
      salaryMin: item.salaryMin,
      salaryMax: item.salaryMax,
      postedAt: item.postedAt,
      source: 'linkedin' as const,
    }))
  } catch (error) {
    console.error('LinkedIn scraper error:', error)
    return []
  }
}

export async function scrapeIndeedJobs(
  searchTerm: string,
  location?: string,
  limit = 20
): Promise<ScrapedJob[]> {
  try {
    const input = {
      search: {
        query: searchTerm,
        location: location ?? 'Worldwide',
      },
      maxResults: limit,
    }

    const run = await client.actor(ACTOR_IDS.indeed).call(input)
    
    const output = run as any
    if (!output?.results || !Array.isArray(output.results)) {
      return []
    }

    return output.results.map((item: any) => ({
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
    return []
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
