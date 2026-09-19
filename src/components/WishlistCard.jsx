import { Link } from 'react-router-dom'
import { timeAgo } from '../store/data.js'
import { ModelThumb } from './ModelThumb.jsx'
import { EditIcon, TrashIcon, GavelIcon, MapPinIcon } from './icons.jsx'

export function WishlistCard({ item, matches, onEdit, onRemove }) {
  const liveAuction = matches.auction && matches.auction.bids.length > 0
  const anyMatch = Boolean(matches.auction) || matches.finds.length > 0

  return (
    <article className="wish-card">
      <ModelThumb name={item.name} brand={item.brand} scale={item.scale} className="wish-card__thumb" />
      <div className="wish-card__body">
        <div className="wish-card__row">
          <span className="wish-card__name">{item.name}</span>
          <span className="wish-card__actions">
            <button type="button" className="btn--icon" aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}>
              <EditIcon size={15} />
            </button>
            <button type="button" className="btn--icon" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item)}>
              <TrashIcon size={15} />
            </button>
          </span>
        </div>
        <span className="wish-card__meta">{item.brand} · {item.scale || 'any scale'} · added {timeAgo(item.addedAt)} ago</span>
        {item.note ? <p className="wish-card__note">{item.note}</p> : null}
        <div className="wish-card__matches">
          {matches.auction ? (
            <Link to={`/auctions/${matches.auction.id}`} className="wish-match wish-match--auction">
              <GavelIcon size={12} /> In auction: {matches.auction.model.name} · {liveAuction ? 'Live' : 'Open'}
            </Link>
          ) : null}
          {matches.finds.slice(0, 2).map((f) => (
            <Link key={f.id} to="/finds" className="wish-match wish-match--find">
              <MapPinIcon size={12} /> Shelf match: {f.title}
            </Link>
          ))}
          {!anyMatch ? <span className="wish-match wish-match--none">No live match yet</span> : null}
        </div>
      </div>
    </article>
  )
}