import { useState, useRef } from 'react'
import type { StudentProfile } from '@/lib/types'
import { motion } from 'framer-motion'
import {
  Plus, X, Upload, FileText, Loader2,
  User, GraduationCap, Star, MapPin, DollarSign,
  Phone, Link, GitBranch, ArrowRight, Briefcase,
} from 'lucide-react'

const OPPORTUNITY_TYPES = ['internship', 'scholarship', 'competition', 'fellowship', 'admission']
const FINANCIAL_OPTIONS = ['high', 'medium', 'low'] as const
const LOCATION_OPTIONS  = ['remote', 'onsite', 'any'] as const

interface Props { onSubmit: (profile: StudentProfile) => void }

const defaultProfile = (): StudentProfile => ({
  name: '', degree_program: '', semester: 1, cgpa: 3.0,
  skills: [], interests: [],
  preferred_opportunity_types: ['internship', 'scholarship'],
  financial_need: 'medium', location_preference: 'any', past_experience: [],
  phone: '', linkedin: '', github: '', city: '', open_to_hiring: false,
})

/* ── Reusable dark input ─────────────────────────────────────────────── */
function DarkInput({ placeholder, value, onChange, type = 'text', min, max, step, required }: {
  placeholder?: string; value: string | number; onChange: (v: string) => void
  type?: string; min?: number; max?: number; step?: number; required?: boolean
}) {
  return (
    <input
      type={type} placeholder={placeholder} value={value} required={required}
      min={min} max={max} step={step}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
    />
  )
}

/* ── Section header ──────────────────────────────────────────────────── */
function Section({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/8">
      <div className="w-8 h-8 rounded-lg bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center">
        <Icon className="h-4 w-4 text-indigo-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function ProfileForm({ onSubmit }: Props) {
  const [form, setForm]         = useState<StudentProfile>(defaultProfile())
  const [inputs, setInputs]     = useState({ skill: '', interest: '', exp: '' })
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof StudentProfile, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }))

  const addTag = (field: 'skills' | 'interests' | 'past_experience', key: keyof typeof inputs) => {
    const val = inputs[key].trim()
    if (!val) return
    setForm(f => ({ ...f, [field]: [...f[field], val] }))
    setInputs(p => ({ ...p, [key]: '' }))
  }

  const removeTag = (field: 'skills' | 'interests' | 'past_experience', i: number) =>
    setForm(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }))

  const toggleType = (t: string) =>
    setForm(f => ({
      ...f,
      preferred_opportunity_types: f.preferred_opportunity_types.includes(t)
        ? f.preferred_opportunity_types.filter(x => x !== t)
        : [...f.preferred_opportunity_types, t],
    }))

  const handleFile = async (file: File) => {
    setUploading(true); setUploadMsg(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/extract-profile', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Extraction failed')
      }
      const data = await res.json()

      // Explicitly map every field so nothing gets missed
      setForm({
        // Identity
        name:            data.name            || '',
        degree_program:  data.degree_program  || '',
        semester:        Number(data.semester) || 1,
        cgpa:            Number(data.cgpa)    || 3.0,
        // Lists
        skills:          Array.isArray(data.skills)          ? data.skills          : [],
        interests:       Array.isArray(data.interests)       ? data.interests       : [],
        past_experience: Array.isArray(data.past_experience) ? data.past_experience : [],
        preferred_opportunity_types: Array.isArray(data.preferred_opportunity_types)
          ? data.preferred_opportunity_types
          : ['internship'],
        // Preferences
        financial_need:      data.financial_need      || 'medium',
        location_preference: data.location_preference || 'any',
        // Contact — populated from regex + AI
        phone:    data.phone    || '',
        linkedin: data.linkedin || '',
        github:   data.github   || '',
        city:     data.city     || '',
        open_to_hiring: data.open_to_hiring || false,
      })

      // Count filled fields to show user what was extracted
      const filled = [
        data.name, data.degree_program, data.phone,
        data.linkedin, data.github, data.city,
      ].filter(Boolean).length
      const skills = data.skills?.length || 0
      const exp    = data.past_experience?.length || 0
      setUploadMsg({
        text: `✓ Auto-filled: ${filled} contact fields, ${skills} skills, ${exp} experiences`,
        ok: true,
      })
    } catch (e: unknown) {
      setUploadMsg({ text: e instanceof Error ? e.message : 'Upload failed', ok: false })
    } finally { setUploading(false) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.degree_program.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Resume Upload ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-600/5 p-6 text-center cursor-pointer transition-all hover:border-indigo-500/50 hover:bg-indigo-600/8"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            {uploading
              ? <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
              : <Upload className="h-6 w-6 text-indigo-400" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {uploading ? 'Extracting profile from resume...' : 'Upload your resume to auto-fill'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">PDF, DOCX, or TXT — drag & drop or click to browse</p>
          </div>
          {!uploading && (
            <button type="button"
              className="flex items-center gap-2 text-xs font-medium text-indigo-400 border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-lg px-4 py-2 transition-all">
              <FileText className="h-3.5 w-3.5" /> Choose File
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          {uploadMsg && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`text-xs font-medium px-4 py-2 rounded-xl ${uploadMsg.ok
                ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                : 'bg-red-500/15 border border-red-500/25 text-red-400'}`}>
              {uploadMsg.text}
            </motion.p>
          )}
        </div>
      </div>

      {/* ── Basic Info ────────────────────────────────────────────────── */}
      <div>
        <Section icon={User} title="Basic Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">Full Name <span className="text-red-400">*</span></label>
            <DarkInput required placeholder="Ahmed Khan" value={form.name} onChange={v => set('name', v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">Degree / Program <span className="text-red-400">*</span></label>
            <DarkInput required placeholder="BS Computer Science" value={form.degree_program} onChange={v => set('degree_program', v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">Semester</label>
            <DarkInput type="number" min={1} max={8} value={form.semester} onChange={v => set('semester', Number(v))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">CGPA (0.0 – 4.0)</label>
            <DarkInput type="number" min={0} max={4} step={0.1} value={form.cgpa} onChange={v => set('cgpa', Number(v))} />
          </div>
        </div>
      </div>

      {/* ── Contact Details ───────────────────────────────────────────── */}
      <div>
        <Section icon={Phone} title="Contact Details" subtitle="Auto-filled from CV · used to match contact-based opportunities" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> Phone Number
            </label>
            <DarkInput placeholder="+92 300 1234567" value={form.phone || ''} onChange={v => set('phone', v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> City / Location
            </label>
            <DarkInput placeholder="Lahore, Pakistan" value={form.city || ''} onChange={v => set('city', v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Link className="h-3 w-3" /> LinkedIn URL
            </label>
            <DarkInput placeholder="https://linkedin.com/in/yourname" value={form.linkedin || ''} onChange={v => set('linkedin', v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <GitBranch className="h-3 w-3" /> GitHub URL
            </label>
            <DarkInput placeholder="https://github.com/yourname" value={form.github || ''} onChange={v => set('github', v)} />
          </div>
        </div>

        {/* Open to Hiring toggle */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => set('open_to_hiring', !form.open_to_hiring)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-300 ${
              form.open_to_hiring
                ? 'bg-emerald-500/12 border-emerald-500/30'
                : 'bg-white/4 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                form.open_to_hiring
                  ? 'bg-emerald-500/25 border border-emerald-500/35'
                  : 'bg-white/8 border border-white/12'
              }`}>
                <Briefcase className={`h-4 w-4 ${form.open_to_hiring ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${form.open_to_hiring ? 'text-emerald-300' : 'text-slate-300'}`}>
                  Open to Opportunities / Hiring
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {form.open_to_hiring
                    ? 'Your profile is marked as actively looking'
                    : 'Toggle on if you\'re actively seeking opportunities'}
                </p>
              </div>
            </div>
            {/* Toggle pill */}
            <div className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
              form.open_to_hiring ? 'bg-emerald-500' : 'bg-white/12'
            }`}>
              <motion.div
                animate={{ x: form.open_to_hiring ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </button>
        </div>
      </div>

      {/* ── Skills & Interests ────────────────────────────────────────── */}
      <div>
        <Section icon={Star} title="Skills & Interests" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 block">Skills</label>
            <div className="flex gap-2">
              <DarkInput placeholder="Python, React, SQL..." value={inputs.skill}
                onChange={v => setInputs(p => ({ ...p, skill: v }))} />
              <button type="button"
                onClick={() => addTag('skills', 'skill')}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('skills', 'skill') }}}
                className="shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 hover:bg-indigo-600/35 transition-all">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {form.skills.map((s, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-full font-medium">
                  {s}
                  <button type="button" onClick={() => removeTag('skills', i)}
                    className="ml-0.5 text-indigo-400 hover:text-red-400 transition-colors">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          {/* Interests */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 block">Interests</label>
            <div className="flex gap-2">
              <DarkInput placeholder="AI, Research, Startups..." value={inputs.interest}
                onChange={v => setInputs(p => ({ ...p, interest: v }))} />
              <button type="button"
                onClick={() => addTag('interests', 'interest')}
                className="shrink-0 w-10 h-10 flex items-center justify-center bg-violet-600/20 border border-violet-500/30 rounded-xl text-violet-400 hover:bg-violet-600/35 transition-all">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {form.interests.map((s, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs rounded-full font-medium">
                  {s}
                  <button type="button" onClick={() => removeTag('interests', i)}
                    className="ml-0.5 text-violet-400 hover:text-red-400 transition-colors">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Opportunity Preferences ───────────────────────────────────── */}
      <div>
        <Section icon={GraduationCap} title="Opportunity Preferences" />
        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-3">Preferred Types</label>
            <div className="flex flex-wrap gap-2">
              {OPPORTUNITY_TYPES.map(t => (
                <button key={t} type="button" onClick={() => toggleType(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all capitalize
                    ${form.preferred_opportunity_types.includes(t)
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-3 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> Financial Need
              </label>
              <div className="flex gap-2">
                {FINANCIAL_OPTIONS.map(opt => (
                  <button key={opt} type="button" onClick={() => set('financial_need', opt)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border capitalize transition-all
                      ${form.financial_need === opt
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Location Preference
              </label>
              <div className="flex gap-2">
                {LOCATION_OPTIONS.map(opt => (
                  <button key={opt} type="button" onClick={() => set('location_preference', opt)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border capitalize transition-all
                      ${form.location_preference === opt
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Past Experience ───────────────────────────────────────────── */}
      <div>
        <Section icon={FileText} title="Past Experience" subtitle="Internships, projects, research, competitions" />
        <div className="space-y-3">
          <div className="flex gap-2">
            <DarkInput placeholder="e.g. Software Intern at XYZ Corp (2024)" value={inputs.exp}
              onChange={v => setInputs(p => ({ ...p, exp: v }))} />
            <button type="button" onClick={() => addTag('past_experience', 'exp')}
              className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/8 border border-white/10 rounded-xl text-slate-400 hover:bg-white/12 hover:text-white transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {form.past_experience.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/8 text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  {s}
                </span>
                <button type="button" onClick={() => removeTag('past_experience', i)}
                  className="text-slate-600 hover:text-red-400 transition-colors ml-2 shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <button type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-700/50 hover:scale-[1.01] flex items-center justify-center gap-2 text-sm">
        Continue to Email Analysis <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}
