import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { money, timeLeft, currentBidOf, bidCountOf, isMine } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { Badge, Button, EmptyState, SectionTitle } from '../components/ui.jsx'
import { AppBar } from '../components/AppBar.jsx'
import { Tabs } from '../components/Tabs.jsx'
import { AuctionCard } from '../components/AuctionCard.jsx'
import { ModelThumb } from '../components/ModelThumb.jsx'
import { ListForAuctionModal } from '../components/forms.jsx'
import { GavelIcon, PlusIcon, TrophyIcon } from '../components/icons.jsx'

function ListingMini({ auction, onOpen }) {
  const live = auction.status === 'active'
  return (
    <button type="button" className="listing-mini" onClick={onOpen}>
      <ModelThumb name={auction.model.name} brand={auction.model.brand} scale={auction.model.scale} className="listing-mini__thumb" />
      <div className="listing-mini__body">
        {live ? <Badge tone="red">On the block</Badge> : <Badge tone="neutral">Ended</Badge>}
        <span className="listing-mini__name">{auction.model.name}</span>
        <span className="listing-mini__price">{money(currentBidOf(auction))}</span>
        <span className="listing-mini__time">{live ? timeLeft(auction.endsAt) : 'Closed'}</span>
      </div>
    </button>
  )
}

export function AuctionsPage() {
  const { state, collectorById, session, isLive } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('live')
  const [showList, setShowList] = useState(false)
  const meId = session.user?.id

  // Selling is a protected action — guests are sent to sign in first.
  const startSell = () => {
    if (!isLive) { navigate('/login', { state: { from: '/auctions' } }); return }
    setShowList(true)
  }

  const pageRef = useRef(null)
  useScrollReveal(pageRef, [tab])

  const myListings = state.auctions.filter((a) => isMine(a.sellerId, meId))
  const live = state.auctions.filter((a) => a.status === 'active')
  const myBids = useMemo(
    () => state.auctions.filter((a) => a.bids.some((b) => isMine(b.userId, meId))),
    [state.auctions, meId]
  )

  const open = (auction) => navigate(`/auctions/${auction.id}`)

  return (
    <>
      <AppBar
        eyebrow="Marketplace"
        title="Live Auctions"
        actions={
          <button type="button" className="appbar__action appbar__action--primary" onClick={startSell}>
            <PlusIcon size={15} /> Sell
          </button>
        }
      />

      <div className="page" ref={pageRef}>
        <div className="page-intro" data-reveal>
          <span className="eyebrow">Marketplace</span>
          <h1 className="page-intro__title">Where rare diecast changes hands</h1>
          <p className="page-intro__sub">
            Track live lots, place your bids and list models straight from your vault.
          </p>
        </div>

        <div className="section">
          <SectionTitle
            title="My listings"
            aside={<span className="muted">{myListings.length} active</span>}
          />
          {myListings.length === 0 ? (
            <EmptyState
              icon={<TrophyIcon size={28} />}
              title="No listings yet"
              text="List an unlisted model from your vault to start an auction."
              action={<Button onClick={startSell}>List a model</Button>}
            />
          ) : (
            <div className="listing-strip" data-reveal="stagger">
              {myListings.map((a) => <ListingMini key={a.id} auction={a} onOpen={() => open(a)} />)}
            </div>
          )}
        </div>

        <Tabs
          full
          tabs={[
            { id: 'live', label: 'Live', count: live.length },
            { id: 'bids', label: 'My bids', count: myBids.length },
          ]}
          active={tab}
          onChange={setTab}
          label="Auction sections"
        />

        {tab === 'live' ? (
          live.length === 0 ? (
            <EmptyState icon={<GavelIcon size={28} />} title="No live auctions" text="Check back later, or list a model from your vault." />
          ) : (
            <div className="auction-grid" data-reveal="stagger">
              {live.map((a) => (
                <AuctionCard key={a.id} auction={a} seller={collectorById(a.sellerId)} onOpen={() => open(a)} />
              ))}
            </div>
          )
        ) : (
          myBids.length === 0 ? (
            <EmptyState icon={<GavelIcon size={28} />} title="No bids yet" text="Open a live auction and place a demo bid." />
          ) : (
            <div className="auction-grid" data-reveal="stagger">
              {myBids.map((a) => (
                <AuctionCard
                  key={a.id}
                  auction={a}
                  seller={collectorById(a.sellerId)}
                  onOpen={() => open(a)}
                />
              ))}
            </div>
          )
        )}

        <p className="muted" style={{ fontSize: 12 }}>
          {live.length} live · {myListings.length} on the block · {bidCountOf(state.auctions[0] || { bids: [] })} bids on the top lot
        </p>
      </div>

      {isLive ? <ListForAuctionModal open={showList} onClose={() => setShowList(false)} preselectedId="" /> : null}
    </>
  )
}
