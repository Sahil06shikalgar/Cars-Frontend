import { WHATSAPP_NUMBER, WHATSAPP_CONTACT_MESSAGE, waShareText, waShareUrl } from '../config.js'
import { WhatsAppIcon } from './icons.jsx'

export function WhatsAppShareButton({ title, url, label, variant = 'ghost', className = '', iconOnly = false }) {
  const href = waShareUrl(waShareText(title || '', url))
  const classes = ['btn', `btn--${variant}`, 'wa-btn', iconOnly ? 'btn--icon' : '', className].join(' ').trim()
  return (
    <a className={classes} href={href} target="_blank" rel="noopener noreferrer" aria-label={label || 'Share on WhatsApp'}>
      <WhatsAppIcon size={15} />
      {label && !iconOnly ? <span>{label}</span> : null}
    </a>
  )
}

// Floating contact bubble shown on every page. Points at the configured
// WhatsApp line with a canned greeting.
export function WhatsAppFloat() {
  const href = `https://wa.me/${String(WHATSAPP_NUMBER).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(WHATSAPP_CONTACT_MESSAGE)}`
  return (
    <a
      className="wa-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
    >
      <WhatsAppIcon size={26} />
      <span className="wa-float__pulse" aria-hidden="true" />
    </a>
  )
}