import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Square, ListChecks, Zap } from 'lucide-react'

interface Props { items: string[] }

export default function TodayQueue({ items }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  if (!items.length) return null

  const toggle = (i: number) => setChecked(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  const progress = Math.round((checked.size / items.length) * 100)

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/25 flex items-center justify-center">
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Do This Today</h3>
            <p className="text-xs text-slate-500">Urgent actions across all opportunities</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 bg-white/6 border border-white/10 px-2.5 py-1 rounded-full">
            {checked.size}/{items.length} done
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/6">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Items */}
      <div className="p-4 space-y-1.5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => toggle(i)}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
              checked.has(i)
                ? 'bg-emerald-500/8 border-emerald-500/20'
                : 'bg-white/4 border-white/6 hover:border-white/15 hover:bg-white/6'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              <AnimatePresence mode="wait">
                {checked.has(i) ? (
                  <motion.div key="checked"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}>
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div key="unchecked"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}>
                    <Square className="h-4 w-4 text-slate-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className={`text-sm leading-snug transition-all ${
              checked.has(i) ? 'line-through text-slate-600' : 'text-slate-300'
            }`}>
              {item}
            </span>
          </motion.div>
        ))}
      </div>

      {/* All done state */}
      <AnimatePresence>
        {checked.size === items.length && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 py-3 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center gap-2"
          >
            <ListChecks className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">All tasks complete — great work!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
