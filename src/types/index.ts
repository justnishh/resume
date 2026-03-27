import { JobStatus, JobSource } from '@prisma/client'

export interface Job {
  id: string
  userId: string
  title: string
  company: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  jobUrl: string | null
  description: string | null
  source: JobSource
  status: JobStatus
  appliedAt: Date | null
  createdAt: Date
  updatedAt: Date
  scrapedAt: Date | null
}

export interface Resume {
  id: string
  userId: string
  versionName: string
  isDefault: boolean
  data: {
    personalInfo: {
      fullName: string
      email: string
      phone?: string
      location?: string
      website?: string
      linkedin?: string
      summary?: string
    }
    experience: Experience[]
    education: Education[]
    skills: Skill[]
    projects: Project[]
    certifications?: Certification[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface Experience {
  id: string
  resumeId: string
  company: string
  title: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description?: string
  order: number
}

export interface Education {
  id: string
  resumeId: string
  institution: string
  degree: string
  field?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description?: string
  order: number
}

export interface Skill {
  id: string
  resumeId: string
  name: string
  category: string
  order: number
}

export interface Project {
  id: string
  resumeId: string
  name: string
  description?: string
  url?: string
  technologies?: string
  startDate?: string
  endDate?: string
  order: number
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date?: string
  url?: string
}

export interface Application {
  id: string
  userId: string
  jobId: string
  job?: Job
  resumeId: string | null
  resume?: Resume
  appliedAt: Date
  notes?: string
  asanaTaskId?: string
  createdAt: Date
  updatedAt: Date
}

export interface SearchPreference {
  id: string
  userId: string
  jobRoles: string[]
  locations: string[]
  sources: string[]
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  total: number
  notApplied: number
  applied: number
  interviewing: number
  offers: number
  rejected: number
}

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

export interface AsanaProjectData {
  id: string
  asanaGid: string
  name: string
  notes?: string
  completedTasks: {
    gid: string
    name: string
    notes?: string
    completed_at?: string
  }[]
  lastSynced: Date
}
