export function PageSkeleton({ path }) {
  if (path === '/finds') {
    return (
      <div className="map-page">
        <div className="skeleton skeleton__map" />
      </div>
    )
  }

  const isDetail = /^\/(car|auctions)\//.test(path)
  const isList = ['/feed', '/messages', '/auctions'].includes(path)

  if (isDetail) {
    return (
      <div className="page skeleton-page" aria-hidden="true">
        <div className="skeleton skeleton__appbar" />
        <div className="skeleton skeleton__row">
          <div className="skeleton skeleton__col" />
          <div className="skeleton skeleton__col" />
        </div>
        <div className="skeleton skeleton__tabs" />
        <div className="skeleton skeleton__grid">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton skeleton__card" />)}
        </div>
      </div>
    )
  }

  if (isList) {
    return (
      <div className="page skeleton-page" aria-hidden="true">
        <div className="skeleton skeleton__appbar" />
        <div className="skeleton skeleton__bar" />
        <div className="skeleton skeleton__list">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton skeleton__item" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="page skeleton-page" aria-hidden="true">
      <div className="skeleton skeleton__appbar" />
      <div className="skeleton skeleton__banner" />
      <div className="skeleton skeleton__tabs" />
      <div className="skeleton skeleton__grid">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton skeleton__card" />)}
      </div>
    </div>
  )
}