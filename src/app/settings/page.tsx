'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  Settings, 
  Search, 
  Link as LinkIcon,
  Key,
  Save,
  Plus,
  Trash2
} from 'lucide-react'

interface SearchPreference {
  id: string
  jobRoles: string[]
  locations: string[]
  sources: string[]
}

interface AsanaConnection {
  connected: boolean
  workspaceName?: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [preferences, setPreferences] = useState<SearchPreference>({
    id: '',
    jobRoles: [],
    locations: [],
    sources: ['linkedin', 'indeed']
  })
  const [newRole, setNewRole] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [asanaConnection, setAsanaConnection] = useState<AsanaConnection>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/api/auth/signin'
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchPreferences()
    }
  }, [session])

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/settings/preferences')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setPreferences(data)
        }
      }
      
      const asanaRes = await fetch('/api/asana/connection')
      if (asanaRes.ok) {
        const asanaData = await asanaRes.json()
        setAsanaConnection(asanaData)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })
      if (res.ok) {
        const data = await res.json()
        setPreferences(data)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const addRole = () => {
    if (newRole.trim() && !preferences.jobRoles.includes(newRole.trim())) {
      setPreferences({
        ...preferences,
        jobRoles: [...preferences.jobRoles, newRole.trim()]
      })
      setNewRole('')
    }
  }

  const removeRole = (role: string) => {
    setPreferences({
      ...preferences,
      jobRoles: preferences.jobRoles.filter(r => r !== role)
    })
  }

  const addLocation = () => {
    if (newLocation.trim() && !preferences.locations.includes(newLocation.trim())) {
      setPreferences({
        ...preferences,
        locations: [...preferences.locations, newLocation.trim()]
      })
      setNewLocation('')
    }
  }

  const removeLocation = (location: string) => {
    setPreferences({
      ...preferences,
      locations: preferences.locations.filter(l => l !== location)
    })
  }

  const toggleSource = (source: string) => {
    const sources = preferences.sources.includes(source)
      ? preferences.sources.filter(s => s !== source)
      : [...preferences.sources, source]
    setPreferences({ ...preferences, sources })
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
                <Settings className="h-8 w-8 text-primary" />
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
              <Link href="/resume" className="text-sm font-medium hover:text-primary transition-colors">
                Resume
              </Link>
              <Link href="/settings" className="text-sm font-medium text-primary">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-8">
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Job Search Preferences</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="label mb-2">Job Roles to Track</label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add roles you want to search for when scraping jobs
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRole()}
                    placeholder="e.g., Software Engineer"
                    className="input flex-1"
                  />
                  <button onClick={addRole} className="btn btn-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferences.jobRoles.map(role => (
                    <span 
                      key={role} 
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {role}
                      <button onClick={() => removeRole(role)} className="hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {preferences.jobRoles.length === 0 && (
                    <p className="text-sm text-muted-foreground">No roles added</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label mb-2">Locations</label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add locations you want to search jobs in
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLocation()}
                    placeholder="e.g., Remote, New York"
                    className="input flex-1"
                  />
                  <button onClick={addLocation} className="btn btn-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferences.locations.map(location => (
                    <span 
                      key={location} 
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-2"
                    >
                      {location}
                      <button onClick={() => removeLocation(location)} className="hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {preferences.locations.length === 0 && (
                    <p className="text-sm text-muted-foreground">No locations added</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label mb-2">Job Sources</label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select which job boards to scrape
                </p>
                <div className="flex gap-4">
                  {['linkedin', 'indeed'].map(source => (
                    <label key={source} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.sources.includes(source)}
                        onChange={() => toggleSource(source)}
                        className="rounded border-input"
                      />
                      <span className="capitalize">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={savePreferences}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>Saving...</>
                ) : saved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Integrations</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Asana</h3>
                  <p className="text-sm text-muted-foreground">
                    {asanaConnection.connected 
                      ? `Connected to ${asanaConnection.workspaceName}` 
                      : 'Import projects from Asana to build your resume'}
                  </p>
                </div>
                {asanaConnection.connected ? (
                  <button className="btn btn-outline btn-sm text-destructive">
                    Disconnect
                  </button>
                ) : (
                  <Link href="/api/asana/connect" className="btn btn-primary btn-sm">
                    Connect
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Apify</h3>
                  <p className="text-sm text-muted-foreground">
                    Used for scraping jobs (configured in environment)
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">API Key</span>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Environment Variables</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">DATABASE_URL</label>
                <input
                  type="password"
                  value="••••••••••••••••"
                  disabled
                  className="input bg-muted"
                />
              </div>
              <div>
                <label className="label">NEXTAUTH_SECRET</label>
                <input
                  type="password"
                  value="••••••••••••••••"
                  disabled
                  className="input bg-muted"
                />
              </div>
              <div>
                <label className="label">APIFY_API_TOKEN</label>
                <input
                  type="password"
                  value="••••••••••••••••"
                  disabled
                  className="input bg-muted"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Environment variables are configured in Vercel dashboard or .env file
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
