import type { GapAnalysisItem } from '@/lib/types'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight, Lock } from 'lucide-react'

interface Props { items: GapAnalysisItem[] }

export default function GapAnalysis({ items }: Props) {
  if (!items.length) return null

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/25 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-sky-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Unlock More Opportunities</h3>
          <p className="text-xs text-slate-500">Complete these gaps to qualify for {items.reduce((n, i) => n + i.unlocks.length, 0)} more</p>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-4 bg-sky-500/8 rounded-xl px-4 py-4 border border-sky-500/20"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white mb-1">
                {item.missing}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <ArrowRight className="h-3 w-3 text-sky-500 shrink-0" />
                <p className="text-xs text-sky-400/80">
                  Unlocks: <span className="text-sky-300 font-medium">{item.unlocks.join(' · ')}</span>
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
