import { createContext, useContext, useState, useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { ChevronDown } from 'lucide-react'

const AccordionContext = createContext<{ value: string; toggle: (v: string) => void }>({
  value: '', toggle: () => {},
})

interface AccordionProps { className?: string; children: ReactNode }
export function Accordion({ className = '', children }: AccordionProps) {
  const [value, setValue] = useState('')
  const toggle = (v: string) => setValue(prev => prev === v ? '' : v)
  return (
    <AccordionContext.Provider value={{ value, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface ItemProps { value: string; className?: string; children: ReactNode }
export function AccordionItem({ value, className = '', children }: ItemProps) {
  return <div data-accordion-value={value} className={className}>{children}</div>
}

interface TriggerProps { className?: string; children: ReactNode }
export function AccordionTrigger({ className = '', children }: TriggerProps) {
  const { value: openValue, toggle } = useContext(AccordionContext)
  const ref = useRef<HTMLButtonElement>(null)

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget.closest('[data-accordion-value]') as HTMLElement
    if (el) toggle(el.dataset.accordionValue ?? '')
  }

  const itemValue = ref.current?.closest('[data-accordion-value]') as HTMLElement | null
  const isOpen = itemValue?.dataset.accordionValue === openValue

  return (
    <button ref={ref} onClick={handleClick}
      className={`flex w-full items-center justify-between text-left transition-colors ${className}`}>
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  )
}

interface ContentProps { className?: string; children: ReactNode }
export function AccordionContent({ className = '', children }: ContentProps) {
  const { value: openValue } = useContext(AccordionContext)
  const ref = useRef<HTMLDivElement>(null)
  const itemEl = ref.current?.closest('[data-accordion-value]') as HTMLElement | null
  const isOpen = itemEl?.dataset.accordionValue === openValue
  return (
    <div ref={ref} className={`${isOpen ? 'block' : 'hidden'} ${className}`}>
      {children}
    </div>
  )
}
