import { useState } from 'react'
import { brandColorOf } from '../store/data.js'
import { photoOf } from '../store/photos.js'

function badgeText(name = '') {
  const words = name.split(/\s+/).filter(Boolean)
  const keep = words
    .filter((w) => /[A-Z0-9]/.test(w) && w.length > 1)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4)
  return keep || name.slice(0, 4).toUpperCase()
}

export function ModelThumb({ name = 'Model', brand = '', scale = '', className = '', photo = '', ...rest }) {
  const color = brandColorOf(brand)
  const [broken, setBroken] = useState(false)
  const src = photo || photoOf(name, brand)
  const showPhoto = Boolean(src) && !broken

  return (
    <div
      className={`thumb ${className}`.trim()}
      role="img"
      aria-label={`${name} diecast model, ${brand || 'unknown brand'}, ${scale || 'unknown scale'}, shown as an illustrated card`}
      style={{ '--brand': color }}
      {...rest}
    >
      {showPhoto ? (
        <img className="thumb__photo" src={src} alt="" loading="lazy" draggable={false} onError={() => setBroken(true)} />
      ) : (
        <>
          <div className="thumb__shadow" aria-hidden="true" />
          <span className="thumb__badge" aria-hidden="true">{badgeText(name)}</span>
        </>
      )}
      {scale ? <span className="thumb__scale" aria-hidden="true">{scale}</span> : null}
    </div>
  )
}