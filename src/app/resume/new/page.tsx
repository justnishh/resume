'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FileText, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'

interface Experience {
  id: string
  company: string
  title: string
  location: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
}

interface Skill {
  name: string
  category: string
}

export default function NewResumePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    versionName: '',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: '',
    },
    experience: [] as Experience[],
    education: [] as Education[],
    skills: [] as Skill[],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to create resume')

      router.push('/resume')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addExperience = () => {
    setForm({
      ...form,
      experience: [
        ...form.experience,
        { id: Date.now().toString(), company: '', title: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' }
      ]
    })
  }

  const addEducation = () => {
    setForm({
      ...form,
      education: [
        ...form.education,
        { id: Date.now().toString(), institution: '', degree: '', field: '', startDate: '', endDate: '' }
      ]
    })
  }

  const addSkill = () => {
    setForm({
      ...form,
      skills: [...form.skills, { name: '', category: 'technical' }]
    })
  }

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...form.experience]
    ;(updated[index] as any)[field] = value
    setForm({ ...form, experience: updated })
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...form.education]
    ;(updated[index] as any)[field] = value
    setForm({ ...form, education: updated })
  }

  const updateSkill = (index: number, field: string, value: string) => {
    const updated = [...form.skills]
    ;(updated[index] as any)[field] = value
    setForm({ ...form, skills: updated })
  }

  const removeExperience = (index: number) => {
    setForm({ ...form, experience: form.experience.filter((_, i) => i !== index) })
  }

  const removeEducation = (index: number) => {
    setForm({ ...form, education: form.education.filter((_, i) => i !== index) })
  }

  const removeSkill = (index: number) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/resume" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Resumes
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create Resume</h1>
              <p className="text-muted-foreground">Fill in your information</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-4">Resume Name</h2>
            <input
              type="text"
              required
              value={form.versionName}
              onChange={(e) => setForm({ ...form, versionName: e.target.value })}
              placeholder="e.g., Software Engineer Resume"
              className="input w-full"
            />
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-4">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.personalInfo.fullName}
                  onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, fullName: e.target.value } })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  required
                  value={form.personalInfo.email}
                  onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, email: e.target.value } })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={form.personalInfo.phone}
                  onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, phone: e.target.value } })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  value={form.personalInfo.location}
                  onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, location: e.target.value } })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">LinkedIn</label>
                <input
                  type="url"
                  value={form.personalInfo.linkedin}
                  onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, linkedin: e.target.value } })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Website</label>
                <input
                  type="url"
                  value={form.personalInfo.website}
                  onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, website: e.target.value } })}
                  className="input"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Summary</label>
              <textarea
                value={form.personalInfo.summary}
                onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, summary: e.target.value } })}
                rows={3}
                placeholder="Brief professional summary..."
                className="input"
              />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Experience</h2>
              <button type="button" onClick={addExperience} className="btn btn-outline btn-sm">
                <Plus className="h-4 w-4 mr-1" /> Add
              </button>
            </div>
            {form.experience.map((exp, index) => (
              <div key={exp.id} className="p-4 border rounded-lg mb-4">
                <div className="flex justify-end mb-2">
                  <button type="button" onClick={() => removeExperience(index)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    className="input"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      className="input"
                      disabled={exp.isCurrent}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                    />
                    <span className="text-sm">Currently working here</span>
                  </label>
                </div>
                <textarea
                  placeholder="Description..."
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  rows={2}
                  className="input mt-4"
                />
              </div>
            ))}
            {form.experience.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No experience added</p>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Education</h2>
              <button type="button" onClick={addEducation} className="btn btn-outline btn-sm">
                <Plus className="h-4 w-4 mr-1" /> Add
              </button>
            </div>
            {form.education.map((edu, index) => (
              <div key={edu.id} className="p-4 border rounded-lg mb-4">
                <div className="flex justify-end mb-2">
                  <button type="button" onClick={() => removeEducation(index)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    className="input"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Start Date"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="End Date"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            ))}
            {form.education.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No education added</p>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Skills</h2>
              <button type="button" onClick={addSkill} className="btn btn-outline btn-sm">
                <Plus className="h-4 w-4 mr-1" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder="Skill name"
                    className="bg-transparent border-none outline-none text-sm w-24"
                  />
                  <select
                    value={skill.category}
                    onChange={(e) => updateSkill(index, 'category', e.target.value)}
                    className="bg-transparent border-none text-xs"
                  >
                    <option value="technical">Technical</option>
                    <option value="soft">Soft</option>
                    <option value="tools">Tools</option>
                  </select>
                  <button type="button" onClick={() => removeSkill(index)} className="text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {form.skills.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No skills added</p>
            )}
          </div>

          <div className="flex gap-4">
            <Link href="/resume" className="btn btn-outline">Cancel</Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Resume'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
