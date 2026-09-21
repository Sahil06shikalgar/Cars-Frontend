// Site-level constants. Set VITE_WHATSAPP_NUMBER (E.164, e.g. "4915112345678")
// in the Frontend/.env to point the WhatsApp contact button at your own line;
// the default below is a demo placeholder.
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '4915112345678'

export const WHATSAPP_CONTACT_MESSAGE =
  'Hi Diecet Gardage! I have a question about a model on the app.'

// Build a https://wa.me link that opens WhatsApp with a prefilled message.
export const waLink = (number, text) =>
  `https://wa.me/${String(number).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`

// Share flow: wa.me without a number opens the WhatsApp contact picker with
// the message prefilled (works on mobile + WhatsApp Web).
export const waShareUrl = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`

// Prefilled "share this page on WhatsApp" message.
export const waShareText = (title, url = globalThis.location?.href || '') =>
  `${title}\n\n${url}`