import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  Inbox, Eye, EyeOff, Loader2, ArrowLeft, Mail,
  Lock, User, CheckCircle, ShieldCheck, RefreshCw, Timer,
} from 'lucide-react'
import { sendSignupOTP, verifySignupOTP, saveAuth } from '@/lib/auth'

type Stage = 'form' | 'otp' | 'done'

const PERKS = [
  'Ranked opportunity dashboard',
  'Eligibility checker per opportunity',
  'Deadline-sorted action queue',
  'Profile gap analysis',
]

export default function SignupPage() {
  const navigate = useNavigate()

  // form state
  const [form, setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [show, setShow]    = useState(false)
  const [loading, setLoad] = useState(false)
  const [error, setError]  = useState('')
  const [stage, setStage]  = useState<Stage>('form')
  const [hint, setHint]    = useState('')

  // OTP state
  const [otpDigits, setDigits] = useState(['', '', '', '', '', ''])
  const [countdown, setCount]  = useState(120)   // 2-minute countdown
  const [resending, setResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  // Countdown timer — runs when on OTP stage
  useEffect(() => {
    if (stage !== 'otp' || countdown <= 0) return
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [stage, countdown])

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── OTP box handlers ──────────────────────────────────────────────────────
  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/, '')
    const next = [...otpDigits]
    next[i] = d
    setDigits(next)
    setError('')
    if (d && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...otpDigits]
    text.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    inputRefs.current[Math.min(text.length, 5)]?.focus()
  }

  // ── Stage 1: Submit form → send OTP ──────────────────────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoad(true); setError('')
    try {
      const res = await sendSignupOTP(form.name.trim(), form.email.trim().toLowerCase(), form.password)
      if (res.debug_otp) setHint(res.debug_otp)
      setStage('otp')
      setCount(120)
      setDigits(['', '', '', '', '', ''])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally { setLoad(false) }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResend(true); setError(''); setHint('')
    try {
      const res = await sendSignupOTP(form.name.trim(), form.email.trim().toLowerCase(), form.password)
      if (res.debug_otp) setHint(res.debug_otp)
      setDigits(['', '', '', '', '', ''])
      setCount(120)
      inputRefs.current[0]?.focus()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally { setResend(false) }
  }

  // ── Stage 2: Verify OTP → create account ─────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = otpDigits.join('')
    if (otp.length < 6) { setError('Enter the complete 6-digit code'); return }
    if (countdown <= 0) { setError('OTP expired — please request a new one'); return }
    setLoad(true); setError('')
    try {
      const res = await verifySignupOTP(form.email.trim().toLowerCase(), otp)
      saveAuth(res.token, res.user)
      setStage('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally { setLoad(false) }
  }

  return (
    <div className="animated-gradient min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pulse-glow pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12 relative z-10">

        {/* Left — perks (hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block flex-1"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center glow">
              <Inbox className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Opportunity <span className="gradient-text">Copilot</span>
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Never miss an<br /><span className="gradient-text">opportunity again</span>
          </h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            AI scans your emails, ranks every scholarship and internship, and tells you exactly what to do today.
          </p>
          <div className="space-y-4">
            {PERKS.map((p, i) => (
              <motion.div key={p}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span className="text-sm text-slate-300">{p}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full lg:max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-8 transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
          </Link>

          <div className="glass rounded-3xl p-8 sm:p-10">

            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center glow">
                  <Inbox className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-white">
                    {stage === 'form' ? 'Create your account'
                      : stage === 'otp' ? 'Verify your email'
                      : 'Welcome aboard!'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {stage === 'form' ? 'Free forever · No credit card needed'
                      : stage === 'otp' ? `OTP sent to ${form.email}`
                      : 'Account created successfully'}
                  </p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2 mt-4">
                {(['form', 'otp', 'done'] as Stage[]).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      stage === s ? 'bg-indigo-600 text-white scale-110'
                      : (['form', 'otp', 'done'].indexOf(stage) > i) ? 'bg-emerald-500/30 border border-emerald-500/40 text-emerald-400'
                      : 'bg-white/6 border border-white/10 text-slate-600'
                    }`}>
                      {(['form', 'otp', 'done'].indexOf(stage) > i) ? <CheckCircle className="h-3 w-3" /> : i + 1}
                    </div>
                    {i < 2 && <div className={`h-px flex-1 w-8 transition-all duration-500 ${(['form', 'otp', 'done'].indexOf(stage) > i) ? 'bg-emerald-500/60' : 'bg-white/10'}`} />}
                  </div>
                ))}
                <span className="text-xs text-slate-500 ml-1">
                  {stage === 'form' ? 'Fill details' : stage === 'otp' ? 'Verify email' : 'Done'}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">

              {/* ── Stage 1: Form ── */}
              {stage === 'form' && (
                <motion.form key="form"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleFormSubmit} className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="text" placeholder="Ali Hassan"
                        value={form.name} onChange={e => set('name', e.target.value)}
                        className="w-full bg-white/6 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="email" placeholder="you@university.edu"
                        value={form.email} onChange={e => set('email', e.target.value)}
                        className="w-full bg-white/6 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type={show ? 'text' : 'password'} placeholder="Min 6 characters"
                        value={form.password} onChange={e => set('password', e.target.value)}
                        className="w-full bg-white/6 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                      <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="flex gap-1 mt-2 h-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${
                            form.password.length > i * 2
                              ? i < 2 ? 'bg-red-500' : i < 3 ? 'bg-amber-500' : 'bg-emerald-500'
                              : 'bg-white/10'
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type={show ? 'text' : 'password'} placeholder="Repeat password"
                        value={form.confirm} onChange={e => set('confirm', e.target.value)}
                        className="w-full bg-white/6 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</motion.p>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/40 hover:scale-[1.02] flex items-center justify-center gap-2 mt-1">
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending verification code...</>
                      : <><ShieldCheck className="h-4 w-4" /> Continue — Verify Email</>}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
                  </p>
                </motion.form>
              )}

              {/* ── Stage 2: OTP ── */}
              {stage === 'otp' && (
                <motion.form key="otp"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleVerify} className="space-y-5"
                >
                  {/* Sent banner */}
                  <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5">
                    <Mail className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-indigo-300 leading-relaxed">
                      A 6-digit verification code was sent to{' '}
                      <span className="font-semibold text-white">{form.email}</span>.
                      Check your inbox and spam folder.
                    </p>
                  </div>

                  {/* Countdown */}
                  <div className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 border transition-colors ${
                    countdown <= 30
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <Timer className={`h-4 w-4 ${countdown <= 30 ? 'text-red-400' : 'text-slate-400'}`} />
                    <span className={`font-mono font-bold text-lg tracking-wider ${countdown <= 30 ? 'text-red-400' : 'text-white'}`}>
                      {fmtTime(countdown)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">remaining</span>
                  </div>

                  {/* Debug hint if email failed */}
                  {hint && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
                      <p className="text-xs text-amber-400 font-medium mb-1">Email delivery failed — Demo OTP:</p>
                      <p className="text-2xl font-bold text-white tracking-[8px] font-mono">{hint}</p>
                    </div>
                  )}

                  {/* OTP digit boxes */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-3 block">Enter 6-digit code</label>
                    <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                      {otpDigits.map((d, i) => (
                        <input
                          key={i}
                          ref={el => { inputRefs.current[i] = el }}
                          type="text" inputMode="numeric" maxLength={1}
                          value={d}
                          onChange={e => handleDigit(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all focus:outline-none
                            ${d ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/6 border-white/10 text-white'}
                            focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/50
                            ${countdown === 0 ? 'opacity-40 pointer-events-none' : ''}`}
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</motion.p>
                  )}

                  <button type="submit" disabled={loading || otpDigits.join('').length < 6 || countdown === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                      : <><ShieldCheck className="h-4 w-4" /> Verify & Create Account</>}
                  </button>

                  {/* Resend */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Didn't receive it?</span>
                    {countdown > 90 ? (
                      <span className="text-slate-600">Resend available soon</span>
                    ) : (
                      <button type="button" onClick={handleResend} disabled={resending}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50">
                        <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                        {resending ? 'Sending...' : 'Resend code'}
                      </button>
                    )}
                  </div>

                  <button type="button" onClick={() => { setStage('form'); setError('') }}
                    className="w-full text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5 pt-1">
                    <ArrowLeft className="h-3 w-3" /> Back to edit details
                  </button>
                </motion.form>
              )}

              {/* ── Stage 3: Done ── */}
              {stage === 'done' && (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4 space-y-5"
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white mb-1">Email Verified!</h3>
                    <p className="text-sm text-slate-400">Account created. You've been signed in.</p>
                  </div>
                  <button onClick={() => navigate('/app')}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02]">
                    Go to App
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
