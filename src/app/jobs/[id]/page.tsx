'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Briefcase, 
  ArrowLeft, 
  ExternalLink, 
  Loader2,
  Trash2,
  Edit
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface Job {
  id: string
  title: string
  company: string
  location: string | null
  jobUrl: string | null
  description: string | null
  source: string
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  not_applied: 'bg-muted text-muted-foreground',
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-yellow-100 text-yellow-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (session) {
      fetchJob()
    }
  }, [session, params.id])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setJob(data)
      } else {
        router.push('/jobs')
      }
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setJob({ ...job!, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const deleteJob = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/jobs/${params.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/jobs')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    } finally {
      setDeleting(false)
    }
  }

  if (status === 'loading' || loading) {
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

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Job not found</p>
      </div>
    )
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
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <span className={cn("px-3 py-1 text-sm rounded-full", statusColors[job.status])}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-lg text-muted-foreground">{job.company}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {job.location && <span>{job.location}</span>}
              <span>•</span>
              <span className="capitalize">{job.source}</span>
              <span>•</span>
              <span>Added {formatDate(job.createdAt)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply
              </a>
            )}
            <button onClick={deleteJob} disabled={deleting} className="btn btn-outline text-destructive">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {['not_applied', 'applied', 'interview', 'offer', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  job.status === status
                    ? statusColors[status]
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {job.description && (
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Description</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
