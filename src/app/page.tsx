import Link from 'next/link'
import { Briefcase, FileText, Search, Zap, Shield, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">JobTracker Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/api/auth/signin"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Track Your Job Applications{' '}
              <span className="text-primary">Effortlessly</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage job applications, scrape new opportunities, and keep your resume updated — 
              all in one powerful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-3">
                Start Free
              </Link>
              <Link href="#features" className="btn btn-outline text-lg px-8 py-3">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-surface">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need to Land Your Dream Job
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Search className="h-6 w-6" />}
                title="Smart Job Scraping"
                description="Automatically scrape jobs from LinkedIn and Indeed based on your preferences. Runs daily via cron."
              />
              <FeatureCard
                icon={<Briefcase className="h-6 w-6" />}
                title="Application Tracking"
                description="Track every application from 'Not Applied' to 'Offer'. One-click apply opens job URLs."
              />
              <FeatureCard
                icon={<FileText className="h-6 w-6" />}
                title="Resume Manager"
                description="Build, manage, and export resumes. Import experience from Asana projects automatically."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Daily Auto-Scrape"
                description="Vercel cron runs daily to find new jobs matching your criteria. Stay updated automatically."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Asana Integration"
                description="Connect Asana to import completed projects as resume experience. Never lose track of your work."
              />
              <FeatureCard
                icon={<Clock className="h-6 w-6" />}
                title="One-Click Apply"
                description="Click to open application URL, auto-marks as applied. Track your progress with visual stats."
              />
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Built for Job Seekers
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop using spreadsheets. Get a centralized system to manage your entire job search.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Jobs Tracked" value="0" />
              <StatCard label="Applications" value="0" />
              <StatCard label="Interviews" value="0" />
              <StatCard label="Offers" value="0" />
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-surface">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Tech Stack
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <TechBadge name="Next.js 14" />
              <TechBadge name="TypeScript" />
              <TechBadge name="Prisma" />
              <TechBadge name="PostgreSQL" />
              <TechBadge name="NextAuth" />
              <TechBadge name="Apify" />
              <TechBadge name="Vercel" />
              <TechBadge name="Tailwind CSS" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-semibold">JobTracker Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 JobTracker Pro. Built for job seekers.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function TechBadge({ name }: { name: string }) {
  return (
    <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
      {name}
    </span>
  )
}
