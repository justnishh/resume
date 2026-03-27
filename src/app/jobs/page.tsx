'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react'
import { cn, formatRelativeDate } from '@/lib/utils'

interface Job {
  id: string
  title: string
  company: string
  location: string | null
  jobUrl: string | null
  source: string
  status: string
  createdAt: string
  updatedAt: string
}

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'not_applied', label: 'Not Applied' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

export default function JobsPage() {
  const { data: session, status } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/api/auth/signin'
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchJobs()
    }
  }, [session, filter])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== id))
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setJobs(jobs.map(j => j.id === id ? { ...j, status } : j))
      }
    } catch (error) {
      console.error('Error updating job:', error)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter
    const matchesSearch = search === '' || 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">JobTracker Pro</span>
              </Link>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/jobs" className="text-sm font-medium text-primary">
                Jobs
              </Link>
              <Link href="/resume" className="text-sm font-medium hover:text-primary transition-colors">
                Resume
              </Link>
              <Link href="/settings" className="text-sm font-medium hover:text-primary transition-colors">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Jobs</h1>
            <p className="text-muted-foreground">{filteredJobs.length} jobs</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/jobs/search" className="btn btn-outline">
              <Search className="h-4 w-4 mr-2" />
              Scrape Jobs
            </Link>
            <Link href="/jobs/new" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input w-auto"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="card p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              {search || filter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first job'}
            </p>
            <Link href="/jobs/new" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Link>
          </div>
        ) : (
          <div className="card divide-y">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onDelete={deleteJob}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function JobCard({ 
  job, 
  onDelete, 
  onStatusChange 
}: { 
  job: Job
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}) {
  const statusColors: Record<string, string> = {
    not_applied: 'bg-muted text-muted-foreground',
    applied: 'bg-blue-100 text-blue-700',
    interview: 'bg-yellow-100 text-yellow-700',
    offer: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{job.title}</h3>
            <span className={cn("px-2 py-0.5 text-xs rounded", statusColors[job.status])}>
              {job.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-muted-foreground">{job.company}</p>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {job.location && <span>{job.location}</span>}
            <span>•</span>
            <span className="capitalize">{job.source}</span>
            <span>•</span>
            <span>{formatRelativeDate(job.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={job.status}
            onChange={(e) => onStatusChange(job.id, e.target.value)}
            className="input w-auto text-sm py-1"
          >
            <option value="not_applied">Not Applied</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          {job.jobUrl && (
            <Link 
              href={job.jobUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline p-2"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          <Link href={`/jobs/${job.id}`} className="btn btn-outline p-2">
            <Edit className="h-4 w-4" />
          </Link>
          <button 
            onClick={() => onDelete(job.id)}
            className="btn btn-outline p-2 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
