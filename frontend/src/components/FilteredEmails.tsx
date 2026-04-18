import type { FilteredEmail } from '@/lib/types'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XCircle, ChevronDown } from 'lucide-react'

interface Props { emails: FilteredEmail[] }

export default function FilteredEmails({ emails }: Props) {
  const [open, setOpen] = useState(false)
  if (!emails.length) return null

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/4 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center">
            <XCircle className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400">Filtered Out ({emails.length} non-opportunities)</h3>
            <p className="text-xs text-slate-600">Emails the AI classified as not actionable</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-slate-600" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-white/8 divide-y divide-white/5">
              {emails.map((e, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
                  <XCircle className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500 truncate">{e.email_subject || '(No subject)'}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{e.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
