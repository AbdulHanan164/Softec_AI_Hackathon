import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Inbox, Mail, Loader2, ArrowLeft, CheckCircle,
  Lock, Eye, EyeOff, RefreshCw, ShieldCheck,
} from 'lucide-react'
import { forgotPassword, verifyOTP, resendOTP, saveAuth } from '@/lib/auth'

type Stage = 'email' | 'otp' | 'done'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [stage, setStage]      = useState<Stage>('email')
  const [email, setEmail]      = useState('')
  const [otpDigits, setDigits] = useState(['', '', '', '', '', ''])
  const [newPass, setNewPass]  = useState('')
  const [show, setShow]        = useState(false)
  const [loading, setLoad]     = useState(false)
  const [resending, setResend] = useState(false)
  const [error, setError]      = useState('')
  const [hint, setHint]        = useState('')    // debug OTP hint
  const [countdown, setCount]  = useState(0)
  const inputRefs              = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

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
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...otpDigits]
    text.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    inputRefs.current[Math.min(text.length, 5)]?.focus()
  }

  // ── Stage 1: Send OTP ────────────────────────────────────────────────────
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email'); return }
    setLoad(true); setError('')
    try {
      const res = await forgotPassword(email.trim().toLowerCase())
      if (res.debug_otp) setHint(res.debug_otp)   // show if email fails
      setStage('otp')
      setCount(60)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally { setLoad(false) }
  }

  // ── Resend ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResend(true); setError(''); setHint('')
    try {
      const res = await resendOTP(email.trim().toLowerCase())
      if (res.debug_otp) setHint(res.debug_otp)
      setDigits(['', '', '', '', '', ''])
      setCount(60)
      inputRefs.current[0]?.focus()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend')
    } finally { setResend(false) }
  }

  // ── Stage 2: Verify OTP + set password ──────────────────────────────────
  const verifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = otpDigits.join('')
    if (otp.length < 6) { setError('Enter the complete 6-digit OTP'); return }
    if (!newPass || newPass.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoad(true); setError('')
    try {
      const res = await verifyOTP(email.trim().toLowerCase(), otp, newPass)
      saveAuth(res.token, res.user)
      setStage('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally { setLoad(false) }
  }

  return (
    <div className="animated-gradient min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-8 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
        </Link>

        <div className="glass rounded-3xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center glow">
              <Inbox className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">Reset Password</h1>
              <p className="text-xs text-slate-500">
                {stage === 'email' ? "We'll send you a 6-digit OTP"
                  : stage === 'otp' ? `OTP sent to ${email}`
                  : 'All done!'}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Stage 1: Email ── */}
            {stage === 'email' && (
              <motion.form key="email"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={sendOTP} className="space-y-4"
              >
                <p className="text-sm text-slate-400">
                  Enter your registered email address. We'll send a 6-digit OTP to reset your password.
                </p>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type="email" placeholder="you@university.edu"
                      value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                      className="w-full bg-white/6 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                  </div>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</motion.p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...</> : <><ShieldCheck className="h-4 w-4" /> Send OTP</>}
                </button>
              </motion.form>
            )}

            {/* ── Stage 2: OTP + new password ── */}
            {stage === 'otp' && (
              <motion.form key="otp"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={verifyAndReset} className="space-y-5"
              >
                {/* OTP sent banner */}
                <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5">
                  <Mail className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-300 leading-relaxed">
                    A 6-digit OTP was sent to <span className="font-semibold text-white">{email}</span>.
                    Check your inbox and spam folder.
                  </p>
                </div>

                {/* Debug hint when email send failed */}
                {hint && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
                    <p className="text-xs text-amber-400 font-medium mb-1">Email delivery failed — Demo OTP:</p>
                    <p className="text-2xl font-bold text-white tracking-[8px] font-mono">{hint}</p>
                  </div>
                )}

                {/* 6-digit OTP boxes */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-3 block">Enter 6-digit OTP</label>
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
                          focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/50`}
                      />
                    ))}
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type={show ? 'text' : 'password'} placeholder="Min 6 characters"
                      value={newPass} onChange={e => { setNewPass(e.target.value); setError('') }}
                      className="w-full bg-white/6 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                    <button type="button" onClick={() => setShow(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPass && (
                    <div className="flex gap-1 mt-2 h-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${newPass.length > i * 2
                          ? i < 2 ? 'bg-red-500' : i < 3 ? 'bg-amber-500' : 'bg-emerald-500'
                          : 'bg-white/10'}`} />
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</motion.p>
                )}

                <button type="submit" disabled={loading || otpDigits.join('').length < 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : 'Verify OTP & Reset Password'}
                </button>

                {/* Resend */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Didn't receive it?</span>
                  {countdown > 0 ? (
                    <span className="text-slate-600">Resend in {countdown}s</span>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={resending}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50">
                      <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                      {resending ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
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
                  <h3 className="font-display text-xl font-bold text-white mb-1">Password Reset!</h3>
                  <p className="text-sm text-slate-400">You've been signed in automatically.</p>
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
  )
}
