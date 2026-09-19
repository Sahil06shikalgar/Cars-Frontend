import { useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MOBILE_NAV_ITEMS, isNavActive } from './navItems.js'

function BottomNavItem({ item }) {
  const { pathname } = useLocation()
  const active = isNavActive(pathname, item)
  const Icon = item.icon
  const setRef = useCallback(
    (node) => {
      if (!node) return
      if (active) node.setAttribute('aria-current', 'page')
      else node.removeAttribute('aria-current')
    },
    [active]
  )

  return (
    <NavLink
      ref={setRef}
      to={item.to}
      end={item.to === '/'}
      className={`nav__item ${active ? 'nav__item--active' : ''}`.trim()}
      aria-label={item.label}
    >
      <span className="nav__icon-wrap">
        <span className="nav__glow" aria-hidden="true" />
        <Icon size={22} className="nav__icon" />
      </span>
      <span className="nav__label">{item.label}</span>
    </NavLink>
  )
}

export function BottomNav() {
  return (
    <nav className="nav" aria-label="Main navigation">
      {MOBILE_NAV_ITEMS.map((item) => (
        <BottomNavItem key={item.to} item={item} />
      ))}
    </nav>
  )
}
