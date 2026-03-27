'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, ArrowLeft, Loader2, Briefcase } from 'lucide-react'

export default function SearchJobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [form, setForm] = useState({
    searchTerm: '',
    location: '',
    sources: ['linkedin', 'indeed'],
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setResults([])

    try {
      const res = await fetch('/api/jobs/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const data = await res.json()
        setResults(data.jobs || [])
      }
    } catch (error) {
      console.error('Error scraping jobs:', error)
    } finally {
      setSearching(false)
    }
  }

  const toggleSource = (source: string) => {
    const sources = form.sources.includes(source)
      ? form.sources.filter(s => s !== source)
      : [...form.sources, source]
    setForm({ ...form, sources })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/jobs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Scrape Jobs</h1>
            <p className="text-muted-foreground">Search and import jobs from job boards</p>
          </div>
        </div>

        <form onSubmit={handleScrape} className="card p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="label">Job Title or Keywords</label>
              <input
                type="text"
                required
                value={form.searchTerm}
                onChange={(e) => setForm({ ...form, searchTerm: e.target.value })}
                placeholder="e.g., Software Engineer, React Developer"
                className="input"
              />
            </div>

            <div>
              <label className="label">Location (optional)</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Remote, New York, London"
                className="input"
              />
            </div>

            <div>
              <label className="label">Sources</label>
              <div className="flex gap-4 mt-2">
                {['linkedin', 'indeed'].map((source) => (
                  <label key={source} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.sources.includes(source)}
                      onChange={() => toggleSource(source)}
                    />
                    <span className="capitalize">{source}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={searching || form.sources.length === 0} className="btn btn-primary w-full">
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Jobs
                </>
              )}
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="card">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Found {results.length} jobs</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {results.map((job: any) => (
                <div key={job.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {job.location && <span>{job.location}</span>}
                        <span className="capitalize">• {job.source}</span>
                      </div>
                    </div>
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">💡 Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Apify free tier: 5,000 credits/month (~50-100 searches)</li>
            <li>• Search terms like "Software Engineer" work best</li>
            <li>• Use "Remote" as location for remote jobs</li>
            <li>• Jobs are automatically saved to your dashboard</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
