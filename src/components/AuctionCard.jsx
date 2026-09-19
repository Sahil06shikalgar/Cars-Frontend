import { ModelThumb } from './ModelThumb.jsx'
import { Badge } from './ui.jsx'
import { money, timeLeft, currentBidOf, bidCountOf } from '../store/data.js'

export function AuctionCard({ auction, seller, onOpen }) {
  const live = auction.status === 'active'
  return (
    <button type="button" className="auction-card" onClick={onOpen}>
      <div className="auction-card__media">
        <ModelThumb name={auction.model.name} brand={auction.model.brand} scale={auction.model.scale} className="auction-card__thumb" />
        <span className="auction-card__live">
          {live ? <Badge tone="red"><span className="live-dot" aria-hidden="true" /> Live</Badge> : <Badge tone="neutral">Ended</Badge>}
        </span>
      </div>
      <div className="auction-card__body">
        <span className="auction-card__name">{auction.model.name}</span>
        <span className="auction-card__by">by {seller ? seller.handle : '@collector'}</span>
        <div className="auction-card__row">
          <div>
            <div className="auction-card__label">Top bid</div>
            <div className="auction-card__price">{money(currentBidOf(auction))}</div>
          </div>
          <div className="right">
            <div className="auction-card__time">{live ? timeLeft(auction.endsAt) : 'Closed'}</div>
            <div className="auction-card__bids">{bidCountOf(auction)} bids</div>
          </div>
        </div>
      </div>
    </button>
  )
}
