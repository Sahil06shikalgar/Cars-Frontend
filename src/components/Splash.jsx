import { useEffect, useState } from 'react'
import { CarIcon } from './icons.jsx'

export function Splash() {
  const [hidden, setHidden] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t1 = window.setTimeout(() => setHidden(true), 1500)
    const t2 = window.setTimeout(() => setGone(true), 2050)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  if (gone) return null

  return (
    <div className={`splash ${hidden ? 'splash--hide' : ''}`.trim()} role="status" aria-label="Diecet Gardage is loading">
      <div className="splash__logo"><CarIcon size={44} /></div>
      <div className="splash__name">Diecet<span> Gardage</span></div>
      <div className="splash__bar"><span className="splash__bar-fill" aria-hidden="true" /></div>
      <span className="splash__tag">Demo garage</span>
    </div>
  )
}