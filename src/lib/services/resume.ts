export interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone?: string
    location?: string
    website?: string
    linkedin?: string
    summary?: string
  }
  experience: {
    id: string
    company: string
    title: string
    location?: string
    startDate: string
    endDate?: string
    isCurrent: boolean
    description?: string
  }[]
  education: {
    id: string
    institution: string
    degree: string
    field?: string
    startDate: string
    endDate?: string
    isCurrent: boolean
    description?: string
  }[]
  skills: {
    id: string
    name: string
    category: 'technical' | 'soft' | 'tools' | 'languages'
  }[]
  projects: {
    id: string
    name: string
    description?: string
    url?: string
    technologies?: string
    startDate?: string
    endDate?: string
  }[]
  certifications?: {
    id: string
    name: string
    issuer: string
    date?: string
    url?: string
  }[]
}

export function createEmptyResume(): ResumeData {
  return {
    personalInfo: {
      fullName: '',
      email: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
  }
}

export function formatResumeForMarkdown(data: ResumeData): string {
  const lines: string[] = []

  lines.push(`# ${data.personalInfo.fullName}`)
  lines.push('')

  const contactParts = [data.personalInfo.email]
  if (data.personalInfo.phone) contactParts.push(data.personalInfo.phone)
  if (data.personalInfo.location) contactParts.push(data.personalInfo.location)
  if (data.personalInfo.linkedin) contactParts.push(data.personalInfo.linkedin)
  if (data.personalInfo.website) contactParts.push(data.personalInfo.website)

  lines.push(contactParts.join(' | '))
  lines.push('')

  if (data.personalInfo.summary) {
    lines.push('## Summary')
    lines.push('')
    lines.push(data.personalInfo.summary)
    lines.push('')
  }

  if (data.experience.length > 0) {
    lines.push('## Experience')
    lines.push('')
    data.experience.forEach((exp) => {
      lines.push(`### ${exp.title} at ${exp.company}`)
      lines.push(`${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`)
      if (exp.location) lines.push(exp.location)
      lines.push('')
      if (exp.description) {
        lines.push(exp.description)
        lines.push('')
      }
    })
  }

  if (data.education.length > 0) {
    lines.push('## Education')
    lines.push('')
    data.education.forEach((edu) => {
      lines.push(`### ${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`)
      lines.push(edu.institution)
      lines.push(`${edu.startDate} - ${edu.isCurrent ? 'Present' : edu.endDate}`)
      lines.push('')
    })
  }

  if (data.skills.length > 0) {
    lines.push('## Skills')
    lines.push('')
    const skillsByCategory = data.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill.name)
      return acc
    }, {} as Record<string, string[]>)

    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      lines.push(`**${capitalize(category)}:** ${skills.join(', ')}`)
    })
    lines.push('')
  }

  if (data.projects.length > 0) {
    lines.push('## Projects')
    lines.push('')
    data.projects.forEach((proj) => {
      lines.push(`### ${proj.name}`)
      if (proj.technologies) lines.push(`*Technologies: ${proj.technologies}*`)
      if (proj.description) lines.push(proj.description)
      if (proj.url) lines.push(`[Link](${proj.url})`)
      lines.push('')
    })
  }

  return lines.join('\n')
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
    'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Git', 'SQL', 'MongoDB',
    'PostgreSQL', 'Redis', 'GraphQL', 'REST', 'API', 'HTML', 'CSS', 'Tailwind', 'Figma',
    'Machine Learning', 'Data Science', 'AI', 'NLP', 'Computer Vision',
  ]

  return commonSkills.filter((skill) =>
    new RegExp(skill, 'i').test(text)
  )
}

export function generateExperienceFromAsanaTask(taskName: string, notes?: string): string {
  const bullets: string[] = []
  
  if (taskName) {
    bullets.push(`• ${taskName}`)
  }
  
  if (notes) {
    const lines = notes.split('\n').filter(line => line.trim())
    lines.forEach(line => {
      bullets.push(`• ${line.trim()}`)
    })
  }

  return bullets.join('\n')
}
