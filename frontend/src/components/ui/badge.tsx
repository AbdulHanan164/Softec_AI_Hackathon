import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral' | 'info'
}

const variants: Record<string, string> = {
  default:  'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  success:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  warning:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  danger:   'bg-red-50 text-red-700 ring-1 ring-red-200',
  neutral:  'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  info:     'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
