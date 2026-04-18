import { useState } from 'react'
import type { RankedOpportunity } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, ExternalLink, CheckCircle2, XCircle,
  HelpCircle, AlertTriangle, ChevronDown, ChevronUp,
  Building2, MapPin, Eye, TrendingUp, FileText, Sparkles,
} from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

/* ── Urgency config ─────────────────────────────────────────────────── */
type UrgencyKey = 'critical' | 'high' | 'medium' | 'low' | 'minimal' | 'expired' | 'unknown'
const URGENCY: Record<UrgencyKey, {
  label: string; pill: string; leftBar: string; glow: string; dot: string
}> = {
  critical: { label: 'Critical — Act Now', pill: 'bg-red-500/15 border-red-500/30 text-red-400',     leftBar: 'bg-red-500',     glow: 'shadow-red-900/20',    dot: 'bg-red-400'     },
  high:     { label: 'High Priority',      pill: 'bg-amber-500/15 border-amber-500/30 text-amber-400', leftBar: 'bg-amber-500',   glow: 'shadow-amber-900/20',  dot: 'bg-amber-400'   },
  medium:   { label: 'Medium Priority',    pill: 'bg-sky-500/15 border-sky-500/30 text-sky-400',       leftBar: 'bg-sky-500',     glow: 'shadow-sky-900/20',    dot: 'bg-sky-400'     },
  low:      { label: 'Low Priority',       pill: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', leftBar: 'bg-emerald-500', glow: 'shadow-emerald-900/20', dot: 'bg-emerald-400' },
  minimal:  { label: 'Minimal Urgency',    pill: 'bg-white/8 border-white/15 text-slate-400',          leftBar: 'bg-slate-500',   glow: '',                     dot: 'bg-slate-400'   },
  expired:  { label: 'Deadline Passed',    pill: 'bg-white/5 border-white/10 text-slate-500',          leftBar: 'bg-slate-600',   glow: '',                     dot: 'bg-slate-500'   },
  unknown:  { label: 'No Deadline',        pill: 'bg-white/5 border-white/10 text-slate-500',          leftBar: 'bg-slate-600',   glow: '',                     dot: 'bg-slate-500'   },
}

const TYPE_ICON: Record<string, string> = {
  internship:  '💼', scholarship: '🎓', competition: '🏆',
  fellowship:  '🔬', admission:   '📚', other:       '📋',
}

/* ── Evidence tooltip ───────────────────────────────────────────────── */
function EvidenceTooltip({ evidence }: { evidence: string | null }) {
  const [show, setShow] = useState(false)
  if (!evidence) return null
  return (
    <span className="relative inline-block ml-1 align-middle">
      <button type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center text-slate-600 hover:text-indigo-400 transition-colors">
        <Eye className="h-3 w-3" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 bottom-6 left-0 w-72 bg-[#1a1b2e] border border-indigo-500/25 rounded-xl p-3.5 text-xs text-slate-300 shadow-2xl shadow-black/50 leading-relaxed"
          >
            <span className="block text-xs font-semibold text-indigo-400 mb-1.5 flex items-center gap-1">
              <Eye className="h-3 w-3" /> Source from email
            </span>
            <span className="italic text-slate-400">"{evidence}"</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/* ── Score bar ──────────────────────────────────────────────────────── */
function ScoreRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-semibold text-slate-400 w-10 text-right shrink-0">{value}/{max}</span>
    </div>
  )
}

/* ── Main card ──────────────────────────────────────────────────────── */
interface Props { opp: RankedOpportunity; index: number }

export default function OpportunityCard({ opp, index }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const toggle = (s: string) => setExpanded(prev => prev === s ? null : s)

  const ext  = opp.extraction
  const urg  = URGENCY[(opp.urgency_level as UrgencyKey)] ?? URGENCY.unknown
  const type = ext.opportunity_type
  const pct  = opp.scores.total

  const radarData = [
    { axis: 'Urgency',      value: Math.round((opp.scores.urgency    / 30) * 100) },
    { axis: 'Profile Fit',  value: Math.round((opp.scores.profile_fit / 35) * 100) },
    { axis: 'Completeness', value: Math.round((opp.scores.completeness / 20) * 100) },
    { axis: 'Benefit',      value: Math.round((opp.scores.benefit    / 15) * 100) },
  ]

  const scoreColor = pct >= 70 ? 'bg-emerald-500' : pct >= 45 ? 'bg-amber-400' : 'bg-slate-500'
  const scoreText  = pct >= 70 ? 'text-emerald-400' : pct >= 45 ? 'text-amber-400' : 'text-slate-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm shadow-xl ${urg.glow}`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${urg.leftBar} rounded-l-2xl`} />

      {/* Header */}
      <div className="pl-5 pr-5 pt-5 pb-4">
        <div className="flex items-start gap-4">

          {/* Rank + type emoji */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center">
              <span className="text-sm font-bold text-white">#{opp.rank}</span>
            </div>
            <span className="text-lg">{TYPE_ICON[type] ?? '📋'}</span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title + badges */}
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="text-base font-semibold text-white leading-snug pr-2">
                {ext.title.value || opp.email_subject}
                <EvidenceTooltip evidence={ext.title.evidence} />
              </h3>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${urg.pill}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${urg.dot} mr-1.5 align-middle`} />
                  {urg.label}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/8 border border-white/12 text-slate-400 capitalize">
                  {type}
                </span>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
              {ext.organization.value && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-slate-600" />
                  <span className="text-slate-400">{ext.organization.value}</span>
                  <EvidenceTooltip evidence={ext.organization.evidence} />
                </span>
              )}
              {ext.location.value && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-slate-600" />
                  <span className="text-slate-400">{ext.location.value}</span>
                </span>
              )}
              {ext.deadline.value && (
                <span className="flex items-center gap-1.5 font-medium text-amber-400/90">
                  <CalendarDays className="h-3 w-3" />
                  Deadline: {ext.deadline.value}
                  <EvidenceTooltip evidence={ext.deadline.evidence} />
                </span>
              )}
              {ext.application_link.value && (
                <a href={ext.application_link.value} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  <ExternalLink className="h-3 w-3" /> Apply Now
                </a>
              )}
            </div>

            {/* Score bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: index * 0.07 + 0.3, duration: 0.7, ease: 'easeOut' }}
                  className={`h-full rounded-full ${scoreColor}`}
                />
              </div>
              <span className={`text-sm font-bold shrink-0 ${scoreText}`}>
                {pct}<span className="text-slate-600 font-normal text-xs">/100</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable sections */}
      <div className="border-t border-white/8 divide-y divide-white/6">

        {/* Score Breakdown */}
        <ExpandSection label="Score Breakdown" icon={TrendingUp} active={expanded === 'score'} onToggle={() => toggle('score')}>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3.5">
              <ScoreRow label="Urgency"      value={opp.scores.urgency}      max={30} color="bg-red-400" />
              <ScoreRow label="Profile Fit"  value={opp.scores.profile_fit}  max={35} color="bg-indigo-500" />
              <ScoreRow label="Completeness" value={opp.scores.completeness} max={20} color="bg-sky-400" />
              <ScoreRow label="Benefit"      value={opp.scores.benefit}      max={15} color="bg-emerald-400" />
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Inter' }} />
                  <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Match / mismatch */}
          {(opp.match_reasons.length > 0 || opp.mismatch_warnings.length > 0) && (
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {opp.match_reasons.length > 0 && (
                <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Why It Matches You</p>
                  <ul className="space-y-2">
                    {opp.match_reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {opp.mismatch_warnings.length > 0 && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Watch Out</p>
                  <ul className="space-y-2">
                    {opp.mismatch_warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </ExpandSection>

        {/* Eligibility */}
        {opp.eligibility_checks.length > 0 && (
          <ExpandSection
            label={`Eligibility — ${opp.eligibility_checks.filter(c => c.status === 'pass').length}/${opp.eligibility_checks.length} criteria passed`}
            icon={CheckCircle2} active={expanded === 'elig'} onToggle={() => toggle('elig')}>
            <div className="p-5 space-y-2">
              {opp.eligibility_checks.map((c, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
                  c.status === 'pass'    ? 'bg-emerald-500/8 border-emerald-500/20'
                  : c.status === 'fail' ? 'bg-red-500/8 border-red-500/20'
                                        : 'bg-amber-500/8 border-amber-500/20'}`}>
                  {c.status === 'pass'    && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {c.status === 'fail'    && <XCircle      className="h-4 w-4 text-red-400     shrink-0 mt-0.5" />}
                  {c.status === 'unknown' && <HelpCircle   className="h-4 w-4 text-amber-400   shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200">{c.criterion}</p>
                    {c.profile_value && <p className="text-xs text-slate-500 mt-0.5">Your value: <span className="text-slate-400">{c.profile_value}</span></p>}
                    {c.evidence && <p className="text-xs text-slate-600 mt-0.5 italic truncate">"{c.evidence}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </ExpandSection>
        )}

        {/* Required Documents */}
        {ext.required_documents.length > 0 && (
          <ExpandSection label={`Required Documents — ${ext.required_documents.length} items`}
            icon={FileText} active={expanded === 'docs'} onToggle={() => toggle('docs')}>
            <div className="p-5">
              <ul className="space-y-2">
                {ext.required_documents.map((doc, i) => doc.value && (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    {doc.value}
                    <EvidenceTooltip evidence={doc.evidence} />
                  </li>
                ))}
              </ul>
            </div>
          </ExpandSection>
        )}

        {/* Action Checklist */}
        <ExpandSection label={`Action Checklist — ${opp.action_checklist.length} steps`}
          icon={Sparkles} active={expanded === 'checklist'} onToggle={() => toggle('checklist')}>
          <div className="p-5">
            <ul className="space-y-2.5">
              {opp.action_checklist.map((item, i) => (
                <ChecklistItem key={i} item={item} />
              ))}
            </ul>
          </div>
        </ExpandSection>
      </div>

      {/* Validation warnings */}
      {opp.validation_warnings.length > 0 && (
        <div className="px-5 py-3 bg-amber-500/8 border-t border-amber-500/20 space-y-1">
          {opp.validation_warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 shrink-0" />{w}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ── Checklist item with checkbox ───────────────────────────────────── */
function ChecklistItem({ item }: { item: string }) {
  const [done, setDone] = useState(false)
  return (
    <motion.li
      className={`flex items-start gap-3 rounded-xl px-4 py-2.5 border cursor-pointer transition-all ${
        done ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-white/4 border-white/8 hover:border-white/15'
      }`}
      onClick={() => setDone(d => !d)}
    >
      <div className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
        done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
      }`}>
        {done && <CheckCircle2 className="h-3 w-3 text-white" />}
      </div>
      <span className={`text-sm transition-all ${done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{item}</span>
    </motion.li>
  )
}

/* ── Expand section ─────────────────────────────────────────────────── */
function ExpandSection({
  label, icon: Icon, active, onToggle, children,
}: {
  label: string; icon: React.ElementType; active: boolean
  onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div>
      <button onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-white/4 transition-all">
        <span className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-slate-600" />
          {label}
        </span>
        <motion.div animate={{ rotate: active ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-slate-600" />
        </motion.div>
      </button>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
