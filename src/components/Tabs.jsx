export function Tabs({ tabs, active, onChange, label = 'Sections', variant = '', full = false }) {
  const classes = ['seg', variant ? `seg--${variant}` : '', full ? 'seg--full' : ''].join(' ').trim()
  return (
    <div className={classes} role="tablist" aria-label={label}>
      {tabs.map((t) => {
        const id = typeof t === 'string' ? t : t.id
        const text = typeof t === 'string' ? t : t.label
        const count = typeof t === 'string' ? null : t.count
        const disabled = typeof t === 'string' ? false : !!t.disabled
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active === id}
            disabled={disabled}
            className={`seg__item ${active === id ? 'seg__item--active' : ''}`.trim()}
            onClick={() => onChange(id)}
          >
            {text}
            {count != null ? <span className="seg__count">{count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
