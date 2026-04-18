import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import {
  Inbox, RotateCcw, CheckCircle, AlertCircle,
  Clock, LogOut, Zap, Trophy, Target,
} from 'lucide-react'
import type { AnalysisResponse, EmailInput, StudentProfile } from '@/lib/types'
import { analyzeEmails, getSampleEmails } from '@/lib/api'
import { getAuth, clearAuth } from '@/lib/auth'
import ProfileForm from '@/components/ProfileForm'
import EmailInputComponent from '@/components/EmailInput'
import OpportunityCard from '@/components/OpportunityCard'
import TodayQueue from '@/components/TodayQueue'
import GapAnalysis from '@/components/GapAnalysis'
import FilteredEmails from '@/components/FilteredEmails'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'

type Step = 'profile' | 'emails' | 'results'

const PAGE = {
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -12 },
  transition: { duration: 0.3 },
} as const

const STEPS = [
  { id: 'profile', label: 'Your Profile' },
  { id: 'emails',  label: 'Your Emails'  },
  { id: 'results', label: 'Results'      },
] as const

function AppTool() {
  const [step, setStep]       = useState<Step>('profile')
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResponse | null>(null)
  const auth = getAuth()

  const handleProfileSubmit = (p: StudentProfile) => { setProfile(p); setStep('emails') }

  const handleAnalyze = async (emails: EmailInput[]) => {
    if (!profile) return
    setLoading(true)
    try {
      const data = await analyzeEmails(profile, emails)
      setResults(data)
      setStep('results')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed.')
    } finally { setLoading(false) }
  }

  const handleReset  = () => { setStep('profile'); setProfile(null); setResults(null) }
  const handleLogout = () => { clearAuth(); window.location.href = '/' }
  const stepIndex    = STEPS.findIndex(s => s.id === step)

  return (
    <div className="animated-gradient min-h-screen">
      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pulse-glow pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

      <Toaster position="top-center" richColors theme="dark" />

      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/8 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center glow">
              <Inbox className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-display font-semibold text-white tracking-tight leading-none">
                Opportunity Inbox Copilot
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">AI-powered email opportunity ranker</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {auth && (
              <span className="text-xs text-slate-400 hidden sm:block mr-2">
                Hi, <span className="text-white font-medium">{auth.user.name.split(' ')[0]}</span>
              </span>
            )}
            {step !== 'profile' && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8 border border-transparent hover:border-white/10">
                <RotateCcw className="h-3.5 w-3.5" /> Start Over
              </button>
            )}
            {auth && (
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-2">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done    = stepIndex > i
            const current = stepIndex === i
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${done    ? 'bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400'
                    : current ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/30'
                               : 'bg-white/6 border border-white/10 text-slate-500'}`}>
                    {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors
                    ${current ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 sm:w-20 transition-all duration-700 ${done ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <AnimatePresence mode="wait">

          {/* Profile step */}
          {step === 'profile' && (
            <motion.div key="profile" {...PAGE}>
              <div className="glass rounded-3xl border border-white/10 p-6 sm:p-8">
                <div className="mb-7">
                  <h2 className="font-display text-2xl font-bold text-white">Tell us about yourself</h2>
                  <p className="text-sm text-slate-400 mt-1">Upload your resume to auto-fill, or complete the form manually.</p>
                </div>
                <ProfileForm onSubmit={handleProfileSubmit} />
              </div>
            </motion.div>
          )}

          {/* Emails step */}
          {step === 'emails' && (
            <motion.div key="emails" {...PAGE}>
              <div className="glass rounded-3xl border border-white/10 p-6 sm:p-8">
                <div className="mb-7">
                  <h2 className="font-display text-2xl font-bold text-white">Add your opportunity emails</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Paste up to 15 emails. Click <span className="text-indigo-400 font-medium">Load Demo Inbox</span> to see a full example instantly.
                  </p>
                </div>
                <EmailInputComponent onAnalyze={handleAnalyze} onLoadSamples={getSampleEmails} loading={loading} />
              </div>
            </motion.div>
          )}

          {/* Results step */}
          {step === 'results' && results && (
            <motion.div key="results" {...PAGE} className="space-y-6">

              {/* Summary stats */}
              <div className="glass rounded-3xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">Analysis Complete</h2>
                    <p className="text-xs text-slate-500">Your personalized opportunity report</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={Inbox}       value={results.total_emails}       label="Emails Scanned"     accent="indigo" />
                  <StatCard icon={CheckCircle} value={results.opportunities_found} label="Opportunities Found" accent="violet" />
                  <StatCard icon={AlertCircle} value={results.ranked_opportunities.filter(o => o.urgency_level === 'critical').length} label="Need Urgent Action" accent="red" />
                  <StatCard icon={Target}      value={results.ranked_opportunities.filter(o => o.is_eligible).length} label="You Qualify For"    accent="emerald" />
                </div>
              </div>

              {/* Today's queue */}
              <TodayQueue items={results.today_queue} />

              {/* Ranked opportunities */}
              {results.ranked_opportunities.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/30 flex items-center justify-center">
                        <Zap className="h-3.5 w-3.5 text-violet-400" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-white">Ranked Opportunities</h2>
                    </div>
                    <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                      Sorted by priority score
                    </span>
                  </div>
                  <div className="space-y-4">
                    {results.ranked_opportunities.map((opp, i) => (
                      <OpportunityCard key={opp.email_index} opp={opp} index={i} />
                    ))}
                  </div>
                </div>
              )}

              <GapAnalysis items={results.gap_analysis} />
              <FilteredEmails emails={results.filtered_out} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, value, label, accent }: {
  icon: React.ElementType; value: number; label: string
  accent: 'indigo' | 'violet' | 'red' | 'emerald'
}) {
  const colors = {
    indigo:  { bg: 'bg-indigo-600/15',  border: 'border-indigo-500/20',  text: 'text-indigo-400',  icon: 'text-indigo-400'  },
    violet:  { bg: 'bg-violet-600/15',  border: 'border-violet-500/20',  text: 'text-violet-400',  icon: 'text-violet-400'  },
    red:     { bg: 'bg-red-600/15',     border: 'border-red-500/20',     text: 'text-red-400',     icon: 'text-red-400'     },
    emerald: { bg: 'bg-emerald-600/15', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
  }
  const c = colors[accent]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`${c.bg} border ${c.border} rounded-2xl p-4 flex flex-col gap-2`}
    >
      <Icon className={`h-4 w-4 ${c.icon}`} />
      <p className={`text-3xl font-bold font-display ${c.text}`}>{value}</p>
      <p className="text-xs text-slate-500 leading-tight">{label}</p>
    </motion.div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/app"             element={<AppTool />} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
