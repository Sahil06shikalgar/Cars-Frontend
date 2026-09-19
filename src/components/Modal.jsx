import { useEffect, useRef } from 'react'
import { XIcon } from './icons.jsx'

export function Modal({ open, title, onClose, children, footer, wide }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = original
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-layer" onClick={onClose}>
      <div
        className={`modal ${wide ? 'modal--wide' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <h3>{title}</h3>
          <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Close dialog">
            <XIcon size={18} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__foot">{footer}</footer> : null}
      </div>
    </div>
  )
}