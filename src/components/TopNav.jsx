import { useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { NAV_ITEMS, isNavActive } from './navItems.js'

function TopNavItem({ item }) {
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
      className={`topnav__item ${active ? 'topnav__item--active' : ''}`.trim()}
      aria-label={item.label}
    >
      <Icon size={16} />
      <span>{item.label}</span>
    </NavLink>
  )
}

const AUTH_PATHS = ['/login', '/signup', '/forgot']

function MobileAccount() {
  const { isLive, currentUser } = useStore()
  const { pathname } = useLocation()
  if (AUTH_PATHS.includes(pathname)) return null
  if (isLive) {
    return (
      <span className="topnav__account topnav__account--who" aria-label={`Signed in as ${currentUser.name}`}>
        {currentUser.name}
      </span>
    )
  }
  return (
    <NavLink to="/login" className="topnav__account">
      Sign in
    </NavLink>
  )
}

export function TopNav() {
  const { pathname } = useLocation()
  const authPage = AUTH_PATHS.includes(pathname)
  return (
    <nav className={`topnav ${authPage ? 'topnav--auth' : ''}`.trim()} aria-label="Main navigation">
      <div className="topnav__links">
        {NAV_ITEMS.map((item) => (
          <TopNavItem key={item.to} item={item} />
        ))}
      </div>
      <MobileAccount />
    </nav>
  )
}
