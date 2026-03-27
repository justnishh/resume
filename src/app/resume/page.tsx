'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  FileText, 
  Plus, 
  Download, 
  Edit, 
  Trash2,
  Copy,
  Check
} from 'lucide-react'

interface Resume {
  id: string
  versionName: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function ResumePage() {
  const { data: session, status } = useSession()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/api/auth/signin'
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchResumes()
    }
  }, [session])

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resume')
      if (res.ok) {
        const data = await res.json()
        setResumes(data)
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return
    
    try {
      const res = await fetch(`/api/resume/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setResumes(resumes.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
    }
  }

  const setDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      if (res.ok) {
        setResumes(resumes.map(r => ({
          ...r,
          isDefault: r.id === id
        })))
      }
    } catch (error) {
      console.error('Error setting default resume:', error)
    }
  }

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
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">JobTracker Pro</span>
              </Link>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
                Jobs
              </Link>
              <Link href="/resume" className="text-sm font-medium text-primary">
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
            <h1 className="text-3xl font-bold">Resume Manager</h1>
            <p className="text-muted-foreground">Create and manage your resumes</p>
          </div>
          <Link href="/resume/new" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Resume
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first resume to start applying to jobs
            </p>
            <Link href="/resume/new" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Resume
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard 
                key={resume.id} 
                resume={resume}
                onDelete={deleteResume}
                onSetDefault={setDefault}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ResumeCard({ 
  resume, 
  onDelete, 
  onSetDefault 
}: { 
  resume: Resume
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}) {
  const [copied, setCopied] = useState(false)

  const handleExport = async (format: 'markdown' | 'json') => {
    try {
      const res = await fetch(`/api/resume/${resume.id}/export?format=${format}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${resume.versionName}.${format === 'markdown' ? 'md' : 'json'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting resume:', error)
    }
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{resume.versionName}</h3>
            {resume.isDefault && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Created {new Date(resume.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/resume/${resume.id}`} className="btn btn-outline btn-sm">
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Link>
        <div className="relative group">
          <button className="btn btn-outline btn-sm">
            <Download className="h-3 w-3 mr-1" />
            Export
          </button>
          <div className="absolute top-full left-0 mt-1 bg-surface border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button 
              onClick={() => handleExport('markdown')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
            >
              Markdown
            </button>
            <button 
              onClick={() => handleExport('json')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
            >
              JSON
            </button>
          </div>
        </div>
        {!resume.isDefault && (
          <button 
            onClick={() => onSetDefault(resume.id)}
            className="btn btn-outline btn-sm"
          >
            Set Default
          </button>
        )}
        <button 
          onClick={() => onDelete(resume.id)}
          className="btn btn-outline btn-sm text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
