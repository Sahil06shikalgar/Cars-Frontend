import { useEffect, useState } from 'react'

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`card ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export function Button({ variant = 'primary', full, className = '', type = 'button', ...rest }) {
  const classes = ['btn', `btn--${variant}`, full ? 'btn--full' : '', className].join(' ').trim()
  return <button type={type} className={classes} {...rest} />
}

const tones = {
  red: 'badge--red',
  orange: 'badge--orange',
  green: 'badge--green',
  blue: 'badge--blue',
  purple: 'badge--purple',
  neutral: 'badge--neutral',
  gold: 'badge--gold',
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  return <span className={`badge ${tones[tone] || tones.neutral} ${className}`.trim()}>{children}</span>
}

export function Rarity({ tier = 'Common', className = '' }) {
  return <span className={`rarity rarity--${String(tier).toLowerCase()} ${className}`.trim()}>{tier}</span>
}

export function Chip({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      className={`chip ${active ? 'chip--active' : ''} ${className}`.trim()}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function StatTile({ label, value, icon }) {
  return (
    <div className="stat-tile">
      {icon ? <span className="stat-tile__icon">{icon}</span> : null}
      <span className="stat-tile__value">{value}</span>
      <span className="stat-tile__label">{label}</span>
    </div>
  )
}

export function ProgressBar({ value, max = 100, left, right }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  return (
    <div className="xp">
      {left || right ? (
        <div className="xp__meta">
          <span>{left}</span>
          <span>{right}</span>
        </div>
      ) : null}
      <div className="xp__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="xp__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Avatar({ user, size = 40, className = '' }) {
  const initials = (user && user.initials) || '?'
  const color = (user && user.color) || '#9aa1ad'
  return (
    <span
      className={`avatar ${className}`.trim()}
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.36) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

export function Field({ label, hint, htmlFor, children }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  )
}

export function SectionTitle({ title, aside, className = '' }) {
  return (
    <div className={`section__head ${className}`.trim()}>
      <h2>{title}</h2>
      {aside}
    </div>
  )
}

export function DemoNote({ children = 'Demo interaction — nothing is sent or charged outside your browser.', className = '' }) {
  return <p className={`demo-note ${className}`.trim()}>{children}</p>
}

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty">
      {icon ? <div className="empty__icon">{icon}</div> : null}
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {action}
    </div>
  )
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function CountUp({ value, duration = 700, format = (v) => v.toLocaleString('en') }) {
  const reduced = prefersReducedMotion()
  const [display, setDisplay] = useState(reduced ? value : 0)

  useEffect(() => {
    if (reduced) return undefined
    let raf
    const start = performance.now()
    const tick = (t) => {
      const progress = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, reduced])

  return <span className="num">{format(display)}</span>
}
