interface ProgressProps {
  value?: number
  className?: string
  color?: string
}

export function Progress({ value = 0, className = '', color = 'bg-indigo-500' }: ProgressProps) {
  return (
    <div className={`relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
