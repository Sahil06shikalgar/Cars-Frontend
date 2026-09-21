import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { money, timeLeft, currentBidOf, bidCountOf, isMine, timeAgo } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { Avatar, Badge, Button, Card, DemoNote, EmptyState, SectionTitle } from '../components/ui.jsx'
import { AppBar } from '../components/AppBar.jsx'
import { CarViewer } from '../components/CarViewer.jsx'
import { ContactModal } from '../components/forms.jsx'
import { GavelIcon, ClockIcon, CheckIcon, TrophyIcon } from '../components/icons.jsx'
import { WhatsAppShareButton } from '../components/WhatsApp.jsx'

function BidForm({ auction, onBid, isLive }) {
  const current = currentBidOf(auction)
  const step = current >= 200 ? 10 : 5
  const minimum = current + step
  const [amount, setAmount] = useState(minimum)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value) { setError('Enter a bid amount.'); return }
    if (value < minimum) { setError(`Minimum next bid is ${money(minimum)}.`); return }
    setError('')
    setBusy(true)
    const ok = await onBid(value)
    setBusy(false)
    if (ok === false) {
      setError(isLive ? 'Your bid was not accepted. Someone may have placed a higher bid — retry to take the lead.' : 'Bid could not be placed right now.')
      setFlash('')
    } else if (ok) {
      setFlash(`Bid of ${money(value)} placed.`)
      setAmount(minimum)
      window.setTimeout(() => setFlash(''), 2400)
    }
  }

  return (
    <form className="form bid-form" onSubmit={submit}>
      <label className="field__label" htmlFor="bid-amount">Your bid (€)</label>
      <div className="row gap">
        <input
          id="bid-amount"
          type="number"
          min={minimum}
          step={step}
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button type="button" variant="soft" onClick={() => setAmount(minimum)}>Min</Button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {flash ? <p className="toast" role="status">{flash}</p> : null}
      <Button type="submit" full disabled={busy}><GavelIcon size={15} /> {busy ? 'Placing bid…' : 'Place bid'}</Button>
      <p className="field__hint">
        Minimum {money(minimum)}{isLive ? ' — the server checks it atomically, so nobody can be outbid by a tie.' : ' · demo bids stay in your browser.'}
      </p>
    </form>
  )
}

function WinnerPicker({ auction, options, collectorById, onPick }) {
  const [pick, setPick] = useState(auction.winnerId || '')
  return (
    <div className="winner-pick">
      <p className="field__label" style={{ marginBottom: 8 }}>Pick the winner</p>
      <div className="row gap wrap">
        {options.map((userId) => {
          const user = collectorById(userId)
          return (
            <button
              key={userId}
              type="button"
              className={`chip ${pick === userId ? 'chip--active' : ''}`.trim()}
              aria-pressed={pick === userId}
              onClick={() => setPick(userId)}
            >
              {user ? user.name : userId}
            </button>
          )
        })}
      </div>
      <div className="row gap spacer-top">
        <Button variant="gold" onClick={() => onPick(pick)} disabled={!pick}><CheckIcon size={15} /> Confirm winner</Button>
        <Button variant="ghost" onClick={() => { setPick(''); onPick('') }}>Clear</Button>
      </div>
    </div>
  )
}

export function AuctionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, collectorById, addBid, buyNow, endAuction, setWinner, session, isLive } = useStore()
  const meId = session.user?.id
  const goSignIn = () => navigate('/login', { state: { from: `/auctions/${id}` } })
  const [buyBusy, setBuyBusy] = useState(false)
  const [buyNote, setBuyNote] = useState('')
  const [showContact, setShowContact] = useState(false)

  const pageRef = useRef(null)
  useScrollReveal(pageRef, [id])

  const auction = state.auctions.find((a) => a.id === id)

  if (!auction) {
    return (
      <>
        <AppBar eyebrow="Marketplace" title="Auction" back="/auctions" />
        <div className="page">
          <EmptyState
            icon={<GavelIcon size={28} />}
            title="Auction not found"
            text="This lot is no longer available in the demo."
            action={<Link className="btn btn--ghost" to="/auctions">Back to auctions</Link>}
          />
        </div>
      </>
    )
  }

  const seller = collectorById(auction.sellerId)
  const sellerIsMe = isMine(auction.sellerId, meId)
  const live = auction.status === 'active'
  const current = currentBidOf(auction)
  const highest = auction.bids.reduce((top, b) => (!top || b.amount >= top.amount ? b : top), null)
  const winner = auction.winnerId ? collectorById(auction.winnerId) : null
  const bidderIds = [...new Set(auction.bids.map((b) => b.userId))]
  const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount)

  return (
    <>
      <AppBar eyebrow={live ? 'Live auction' : 'Closed auction'} title={auction.model.name} back="/auctions" />

      <div className="page auction-detail" ref={pageRef}>
        <div className="auction-hero" data-reveal>
          <CarViewer
            name={auction.model.name}
            brand={auction.model.brand}
            className="auction-hero__thumb"
            data-parallax="30"
          />

          <div className="detail__info">
            <div className="detail__badges">
              {live ? <Badge tone="red"><span className="live-dot" aria-hidden="true" /> Live</Badge> : <Badge tone="neutral">Ended</Badge>}
              <Badge tone="blue">{auction.model.brand}</Badge>
              <Badge tone="neutral">{auction.model.scale}</Badge>
              {auction.buyNow ? <Badge tone="gold">Buy now {money(auction.buyNow)}</Badge> : null}
              {sellerIsMe ? <Badge tone="purple">Your listing</Badge> : null}
            </div>

            <div>
              <h2 className="auction-hero__title">{auction.model.name}</h2>
              <p className="auction-hero__by">
                Listed by {seller ? seller.name : 'collector'} {seller ? seller.handle : ''} · {timeAgo(auction.opening)} ago
              </p>
              {!sellerIsMe ? (
                <div className="row gap wrap">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => (isLive ? setShowContact(true) : goSignIn())}>
                    Message seller
                  </button>
                  <WhatsAppShareButton
                    title={`${auction.model.name} ${auction.model.brand} · live auction on Diecet Gardage (current bid ${money(current)}): `}
                    label="Share"
                    className="btn--sm"
                  />
                </div>
              ) : null}
            </div>

            <div className="auction-hero__price">
              <div>
                <span className="portfolio__label">Current bid</span>
                <b>{money(current)}</b>
                <div className="auction-card__bids">{bidCountOf(auction)} bids · start {money(auction.startingBid)}</div>
              </div>
              <div className="right">
                <div className="auction-card__label">Time left</div>
                <div className="auction-card__time">{live ? timeLeft(auction.endsAt) : 'Closed'}</div>
              </div>
            </div>

            {live && !sellerIsMe && !isLive ? (
              <div className="buy-now">
                <div className="buy-now__info">
                  <b>Sign in to bid</b>
                  <span>Bidding and buying on an auction needs an account.</span>
                </div>
                <Button variant="gold" onClick={goSignIn}>Sign in</Button>
              </div>
            ) : null}

            {live && !sellerIsMe && isLive ? (
              <>
                {buyNote ? <p className="toast" role="status">{buyNote}</p> : null}
                <BidForm
                  key={current}
                  auction={auction}
                  isLive={isLive}
                  onBid={(amount) => addBid(auction.id, amount)}
                />
                {auction.buyNow ? (
                  <div className="buy-now">
                    <div className="buy-now__info">
                      <b>{money(auction.buyNow)}</b>
                      <span>Skip the auction and own it right now.</span>
                    </div>
                    <Button
                      variant="gold"
                      onClick={async () => {
                        setBuyBusy(true)
                        const ok = await buyNow(auction.id)
                        setBuyBusy(false)
                        setBuyNote(ok
                          ? `You bought it for ${money(auction.buyNow)} — the auction is closed.`
                          : isLive ? 'That lot just sold to someone else.' : 'Could not complete the purchase.')
                      }}
                      disabled={buyBusy}
                    >
                      {buyBusy ? 'Buying…' : 'Buy now'}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}

            {live && sellerIsMe ? (
              <div className="row gap wrap">
                <p className="banner" style={{ flex: 1 }}>
                  <TrophyIcon size={15} /> You are the seller — watch the bids, then end the auction.
                </p>
                <Button variant="danger" onClick={() => endAuction(auction.id)}>End auction now</Button>
              </div>
            ) : null}

            {!live ? (
              <div className="winner-note">
                <TrophyIcon size={15} />
                {winner
                  ? `Winner: ${winner.name} at ${money(current)}`
                  : 'Auction closed — no winner has been selected yet.'}
              </div>
            ) : null}

            {!live && sellerIsMe ? (
              <WinnerPicker
                auction={auction}
                options={bidderIds}
                collectorById={collectorById}
                onPick={(userId) => setWinner(auction.id, userId)}
              />
            ) : null}
          </div>
        </div>

        <Card data-reveal>
          <SectionTitle title="Bid history" aside={<span className="muted">{bidCountOf(auction)} bids</span>} />
          {sortedBids.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>No bids yet — be the first to bid on this lot.</p>
          ) : (
            <ul className="bid-history" data-reveal="stagger">
              {sortedBids.map((bid, i) => {
                const user = collectorById(bid.userId)
                const isTop = highest && bid.amount === highest.amount && i === 0
                return (
                  <li key={`${bid.userId}-${bid.at}-${i}`} className={`bid-row ${isTop ? 'bid-row--top' : ''}`.trim()}>
                    <Avatar user={user} size={34} className="bid-row__avatar" />
                    <span className="bid-row__main">
                      <b className="bid-row__name">{isMine(bid.userId, meId) ? 'You' : (user ? user.name : 'Collector')}</b>
                      <span className="bid-row__meta">
                        <ClockIcon size={11} /> {timeAgo(bid.at)} ago
                      </span>
                    </span>
                    <span className="bid-row__amount">{money(bid.amount)}</span>
                    {isTop ? <Badge tone="gold" className="bid-row__top">Top</Badge> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="row end">
          <Link className="btn btn--ghost" to="/auctions">Back to auctions</Link>
        </div>

        <DemoNote />
      </div>

      {showContact && auction ? (
        <ContactModal
          userId={auction.sellerId}
          title={`Message ${seller ? seller.handle : 'the seller'}`}
          open={showContact}
          onClose={() => setShowContact(false)}
        />
      ) : null}
    </>
  )
}
