import { MapPinIcon, CompassIcon, GavelIcon, BoxIcon, UserIcon } from './icons.jsx'

export const NAV_ITEMS = [
  { to: '/', label: 'Vault', icon: BoxIcon, aliases: ['/car'] },
  { to: '/finds', label: 'Map', icon: MapPinIcon, aliases: [] },
  { to: '/feed', label: 'Explore', icon: CompassIcon, aliases: [] },
  { to: '/auctions', label: 'Bids', icon: GavelIcon, aliases: [] },
  { to: '/login', label: 'Sign In', icon: UserIcon, aliases: ['/signup', '/forgot'] },
]

const MOBILE_ORDER = ['/finds', '/feed', '/auctions', '/']

export const MOBILE_NAV_ITEMS = MOBILE_ORDER
  .map((to) => NAV_ITEMS.find((item) => item.to === to))
  .filter(Boolean)

export function isNavActive(pathname, item) {
  const path = (pathname || '/').replace(/\/+$/, '') || '/'
  if (path === item.to) return true
  if (item.to !== '/' && path.startsWith(`${item.to}/`)) return true
  return (item.aliases || []).some((alias) => path === alias || path.startsWith(`${alias}/`))
}
