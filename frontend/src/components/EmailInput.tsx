import { useState } from 'react'
import type { EmailInput as EmailInputType } from '@/lib/types'
import { Plus, Trash2, Inbox, Loader2, Mail, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onAnalyze: (emails: EmailInputType[]) => void
  onLoadSamples: () => Promise<EmailInputType[]>
  loading: boolean
}

const emptyEmail = (): EmailInputType => ({ subject: '', sender: '', body: '' })

export default function EmailInput({ onAnalyze, onLoadSamples, loading }: Props) {
  const [emails, setEmails]           = useState<EmailInputType[]>([emptyEmail()])
  const [loadingSamples, setLoadingSamples] = useState(false)

  const update = (i: number, field: keyof EmailInputType, value: string) =>
    setEmails(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))

  const handleLoadSamples = async () => {
    setLoadingSamples(true)
    try { setEmails(await onLoadSamples()) }
    finally { setLoadingSamples(false) }
  }

  const filled = emails.filter(e => e.subject.trim() && e.body.trim()).length

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-white">{filled}</span>
          <span className="text-slate-500"> of {emails.length} emails ready</span>
          <span className="text-slate-600 ml-1">· max 15</span>
        </p>
        <button onClick={handleLoadSamples} disabled={loadingSamples}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-400 border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl px-4 py-2 transition-all disabled:opacity-50">
          {loadingSamples
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...</>
            : <><Inbox className="h-3.5 w-3.5" /> Load Demo Inbox</>}
        </button>
      </div>

      {/* Email cards */}
      <AnimatePresence initial={false}>
        {emails.map((email, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl border border-white/10 bg-white/4 overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/4 border-b border-white/8">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/25 flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                Email {i + 1}
                {email.subject && (
                  <span className="text-xs text-slate-600 font-normal truncate max-w-40">— {email.subject}</span>
                )}
              </div>
              {emails.length > 1 && (
                <button onClick={() => setEmails(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block">Subject</label>
                  <input
                    placeholder="e.g. Google STEP Internship 2026"
                    value={email.subject}
                    onChange={e => update(i, 'subject', e.target.value)}
                    className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block">Sender</label>
                  <input
                    placeholder="e.g. careers@google.com"
                    value={email.sender}
                    onChange={e => update(i, 'sender', e.target.value)}
                    className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block">Email Body</label>
                <textarea
                  placeholder="Paste the full email content here..."
                  rows={5}
                  value={email.body}
                  onChange={e => update(i, 'body', e.target.value)}
                  className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all resize-none"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add email */}
      {emails.length < 15 && (
        <button onClick={() => setEmails(prev => [...prev, emptyEmail()])}
          className="w-full border-2 border-dashed border-white/10 rounded-2xl py-4 text-sm text-slate-600 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-600/5 transition-all flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> Add Another Email
        </button>
      )}

      {/* Analyze button */}
      <button
        onClick={() => onAnalyze(emails.filter(e => e.subject.trim() && e.body.trim()))}
        disabled={loading || filled === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-700/50 hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
      >
        {loading
          ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing {filled} emails with AI...</>
          : <><Sparkles className="h-4 w-4" /> Analyze & Rank {filled} {filled === 1 ? 'Email' : 'Emails'}</>}
      </button>
    </div>
  )
}
