import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from './icons.jsx'

export function AppBar({ eyebrow, title, back, actions }) {
  return (
    <header className="appbar">
      <div className="appbar__inner">
        <div className="appbar__left">
          {back ? (
            typeof back === 'string' ? (
              <Link className="appbar__back" to={back} aria-label="Go back">
                <ChevronLeftIcon size={20} />
              </Link>
            ) : (
              <button type="button" className="appbar__back" onClick={back} aria-label="Go back">
                <ChevronLeftIcon size={20} />
              </button>
            )
          ) : null}
          <div className="appbar__titles">
            {eyebrow ? <span className="appbar__eyebrow">{eyebrow}</span> : null}
            <h1 className="appbar__title">{title}</h1>
          </div>
        </div>
        {actions ? <div className="appbar__actions">{actions}</div> : null}
      </div>
    </header>
  )
}
