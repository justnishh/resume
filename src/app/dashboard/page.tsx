import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { 
  Briefcase, 
  FileText, 
  Search, 
  Plus, 
  ExternalLink, 
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  TrendingUp
} from 'lucide-react'
import { cn, formatRelativeDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getDashboardData(userId: string) {
  const [jobs, resumes, preferences] = await Promise.all([
    prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.resume.findMany({
      where: { userId, isDefault: true },
      take: 1,
    }),
    prisma.searchPreference.findFirst({
      where: { userId },
    }),
  ])

  const stats = {
    total: jobs.length,
    notApplied: jobs.filter(j => j.status === 'not_applied').length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interviewing: jobs.filter(j => j.status === 'interview').length,
    offers: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
  }

  const recentJobs = jobs.slice(0, 5)

  return { jobs, resumes, preferences, stats, recentJobs }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const { jobs, resumes, preferences, stats, recentJobs } = await getDashboardData(session.user.id)

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
              <Link href="/dashboard" className="text-sm font-medium text-primary">
                Dashboard
              </Link>
              <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your job search</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<Briefcase className="h-5 w-5" />}
            label="Total Jobs"
            value={stats.total}
            color="bg-primary/10 text-primary"
          />
          <StatCard 
            icon={<Clock className="h-5 w-5" />}
            label="Not Applied"
            value={stats.notApplied}
            color="bg-muted text-muted-foreground"
          />
          <StatCard 
            icon={<CheckCircle className="h-5 w-5" />}
            label="Applied"
            value={stats.applied}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard 
            icon={<MessageCircle className="h-5 w-5" />}
            label="Interviewing"
            value={stats.interviewing}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Recent Jobs</h2>
                <Link href="/jobs" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              {recentJobs.length === 0 ? (
                <div className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No jobs yet</p>
                  <Link href="/jobs/new" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Job
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {recentJobs.map((job) => (
                    <JobRow key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-4">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/jobs/new" className="btn btn-outline w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job Manually
                </Link>
                <Link href="/jobs/search" className="btn btn-outline w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Scrape Jobs
                </Link>
                <Link 
                  href={resumes[0] ? `/resume/${resumes[0].id}` : '/resume'} 
                  className="btn btn-outline w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {resumes[0] ? 'View Resume' : 'Create Resume'}
                </Link>
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold mb-4">Search Preferences</h3>
              {preferences ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Job Roles</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.jobRoles.length > 0 ? (
                        preferences.jobRoles.map(role => (
                          <span key={role} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted">Not set</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Locations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.locations.length > 0 ? (
                        preferences.locations.map(loc => (
                          <span key={loc} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                            {loc}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted">Not set</span>
                      )}
                    </div>
                  </div>
                  <Link href="/settings" className="text-sm text-primary hover:underline">
                    Edit preferences
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">Set up your job search</p>
                  <Link href="/settings" className="btn btn-primary btn-sm">
                    Configure
                  </Link>
                </div>
              )}
            </div>

            <div className="card p-4">
              <h3 className="font-semibold mb-4">Application Pipeline</h3>
              <div className="space-y-3">
                <PipelineBar label="Not Applied" value={stats.notApplied} total={stats.total} color="bg-muted" />
                <PipelineBar label="Applied" value={stats.applied} total={stats.total} color="bg-blue-500" />
                <PipelineBar label="Interview" value={stats.interviewing} total={stats.total} color="bg-yellow-500" />
                <PipelineBar label="Offers" value={stats.offers} total={stats.total} color="bg-green-500" />
                <PipelineBar label="Rejected" value={stats.rejected} total={stats.total} color="bg-red-500" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

function JobRow({ job }: { job: any }) {
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
          <h4 className="font-medium truncate">{job.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{job.company}</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            {job.location && <span>{job.location}</span>}
            <span>•</span>
            <span>{formatRelativeDate(job.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-1 text-xs rounded", statusColors[job.status])}>
            {job.status.replace('_', ' ')}
          </span>
          {job.jobUrl && (
            <Link 
              href={job.jobUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-muted rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function PipelineBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
