import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from './TopNav.jsx'
import { BottomNav } from './BottomNav.jsx'

function ScrollProgress() {
  const { pathname } = useLocation()
  const fill = useRef(null)

  useEffect(() => {
    if (pathname === '/finds') return
    const main = document.querySelector('.app__main')
    if (!main) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = main.scrollHeight - main.clientHeight
      const p = max > 0 ? main.scrollTop / max : 0
      if (fill.current) fill.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    main.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      main.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  if (pathname === '/finds') return null
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={fill} className="scroll-progress__fill" />
    </div>
  )
}

// Shared shell rendered for every route via <Outlet />. Desktop gets the
// rounded pill top navigation, mobile keeps the existing bottom navigation.
export function AppLayout() {
  return (
    <div className="app">
      <main className="app__main">
        <ScrollProgress />
        <div className="app__inner">
          <TopNav />
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

export default AppLayout