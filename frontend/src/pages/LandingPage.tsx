import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Inbox, Zap, Shield, BarChart3, CheckCircle, ArrowRight,
  Star, Mail, Target, Clock, Sparkles, ChevronRight,
} from 'lucide-react'

const FADE_UP = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.6 } },
}
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

const FEATURES = [
  {
    icon: Shield,
    title: 'Zero Hallucination',
    desc: 'Every extracted fact is paired with an exact quote from the email. No quote — no claim. 7-stage validation pipeline.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: Target,
    title: 'Eligibility Matcher',
    desc: 'CGPA, degree, semester — automatically checked against each opportunity. See exactly what you qualify for.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Priority Scoring',
    desc: 'Opportunities scored on urgency, fit, completeness and benefit. The most important ones bubble to the top.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Clock,
    title: '"Do This Today" Queue',
    desc: 'A consolidated cross-opportunity checklist sorted by deadline. Never miss a critical action again.',
    color: 'from-pink-500 to-rose-500',
  },
]

const STEPS = [
  { num: '01', title: 'Fill Your Profile',    desc: 'Tell us your degree, CGPA, skills and preferences — or upload your resume and let AI auto-fill.' },
  { num: '02', title: 'Paste Your Emails',    desc: 'Add up to 15 opportunity emails. Or click "Load Demo Inbox" to see a live example instantly.' },
  { num: '03', title: 'Get Ranked Results',   desc: 'AI classifies, extracts, validates and scores every email. Your personalized opportunity dashboard is ready in seconds.' },
]

const STATS = [
  { value: '7',    label: 'Anti-Hallucination Stages' },
  { value: '100%', label: 'Evidence-Backed Facts' },
  { value: '<30s', label: 'Analysis Time' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="animated-gradient min-h-screen text-white overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl bg-black/20"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center glow">
              <Inbox className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              Opportunity <span className="gradient-text">Copilot</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/8 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-900/40 hover:shadow-indigo-700/40 hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-32 px-6">
        {/* Background glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pulse-glow pointer-events-none" />
        <div className="absolute top-24 right-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-xs font-medium text-indigo-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered · Evidence-backed · Zero guesswork
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            Your AI Inbox{' '}
            <span className="gradient-text">Copilot</span>
            <br />for Every Opportunity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Paste your opportunity emails. In seconds, AI scans, ranks, and tells you exactly which
            scholarships, internships and competitions you qualify for — and what to do today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-900/50 hover:shadow-indigo-700/50 hover:scale-105 text-base"
            >
              Start for Free <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/app')}
              className="flex items-center justify-center gap-2 glass hover:bg-white/10 text-white font-medium px-8 py-4 rounded-2xl transition-all text-base"
            >
              <Mail className="h-5 w-5 text-indigo-400" /> Try Demo Inbox
            </button>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-16 glass rounded-3xl p-1 glow float"
          >
            <div className="rounded-[22px] bg-slate-900/80 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 h-6 glass rounded-lg flex items-center px-3">
                  <span className="text-slate-500 text-xs">opportunity-copilot.app</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Emails Scanned',  value: '10', color: 'text-slate-300' },
                  { label: 'Opportunities',   value: '7',  color: 'text-indigo-400' },
                  { label: 'Urgent Actions',  value: '2',  color: 'text-red-400' },
                  { label: 'You Qualify For', value: '5',  color: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="glass rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              {[
                { rank: 1, title: 'Google STEP Internship',    score: 94, urgency: 'critical', badge: 'bg-red-500/20 text-red-400' },
                { rank: 2, title: 'HEC Need-Based Scholarship', score: 87, urgency: 'high',    badge: 'bg-amber-500/20 text-amber-400' },
                { rank: 3, title: 'Microsoft Imagine Cup',      score: 79, urgency: 'high',    badge: 'bg-amber-500/20 text-amber-400' },
              ].map(o => (
                <div key={o.rank} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 text-xs flex items-center justify-center font-semibold">{o.rank}</span>
                  <span className="flex-1 text-sm text-slate-300 font-medium">{o.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${o.badge}`}>{o.urgency}</span>
                  <span className="text-xs text-indigo-400 font-semibold">{o.score}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            variants={STAGGER} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-3 gap-8 text-center"
          >
            {STATS.map(s => (
              <motion.div key={s.label} variants={FADE_UP}>
                <p className="font-display text-4xl font-bold gradient-text mb-1">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-3">Why Copilot?</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Built different from<br /><span className="gradient-text">day one</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Every feature is designed to eliminate guesswork and save you hours of inbox overwhelm.</p>
          </motion.div>

          <motion.div
            variants={STAGGER} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {FEATURES.map(f => (
              <motion.div key={f.title} variants={FADE_UP}
                className="glass rounded-2xl p-6 hover:bg-white/8 transition-all group cursor-default"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              Three steps to<br /><span className="gradient-text">clarity</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 flex items-start gap-6 hover:bg-white/8 transition-all"
              >
                <span className="font-display text-5xl font-bold gradient-text opacity-60 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 pointer-events-none" />
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />)}
            </div>
            <blockquote className="font-display text-xl sm:text-2xl font-medium mb-6 relative z-10 leading-relaxed">
              "I used to spend hours sorting through scholarship emails. Now I paste them all in,
              and in 20 seconds I know exactly which ones are worth applying to and what to do first."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-semibold text-sm">A</div>
              <div className="text-left">
                <p className="text-sm font-semibold">Ahmad Raza</p>
                <p className="text-xs text-slate-500">BS CS, FAST-NUCES</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/20 rounded-3xl blur-3xl" />
              <div className="relative glass rounded-3xl p-10 sm:p-16">
                <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
                  Stop missing <span className="gradient-text">opportunities</span>
                </h2>
                <p className="text-slate-400 mb-8 text-lg">
                  Join students who never miss a deadline or a scholarship they qualify for.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-10 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-900/50 hover:scale-105 text-base"
                  >
                    Create Free Account <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-500">
                  {['No credit card', 'No setup', 'Results in seconds'].map(t => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/80 flex items-center justify-center">
              <Inbox className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-sm font-medium text-slate-400">Opportunity Copilot</span>
          </div>
          <p className="text-xs text-slate-600">Built for SOFTEC 2026 · AI Hackathon</p>
        </div>
      </footer>
    </div>
  )
}
