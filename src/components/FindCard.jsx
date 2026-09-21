import { useState } from 'react'
import { Button, Badge } from './ui.jsx'
import { money, timeLeft, timeAgo } from '../store/data.js'
import { photoOfFind } from '../store/photos.js'
import { ContactModal, TradeRequestModal, ReportModal } from './forms.jsx'
import { WhatsAppShareButton } from './WhatsApp.jsx'

const STATUS = {
  active: { tone: 'green', label: 'Still there' },
  grabbed: { tone: 'gold', label: 'You grabbed this' },
  soldout: { tone: 'neutral', label: 'Sold out' },
}

export function FindCard({ find, user, onStatus, canManage = true, isLive = false }) {
  const [photoBroken, setPhotoBroken] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showTrade, setShowTrade] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const initials = (find.brand || 'Any').slice(0, 3).toUpperCase()
  const status = STATUS[find.status] || STATUS.active
  const done = find.status !== 'active' && find.status !== undefined
  const src = find.photoUrl || photoOfFind(find)
  const showPhoto = Boolean(src) && !photoBroken
  const grab = () => onStatus && onStatus('grabbed')

  const contactTitle = find.type === 'trade'
    ? `Trade with ${user ? user.handle : 'collector'}`
    : `Message ${user ? user.handle : 'collector'}`

  return (
    <article className={`find-card ${done ? 'find-card--done' : ''}`.trim()}>
      <div className="find-card__thumb" style={{ '--hue': find.hue ?? 20 }} aria-hidden="true">
        {showPhoto ? (
          <img className="find-card__photo" src={src} alt="" loading="lazy" draggable={false} onError={() => setPhotoBroken(true)} />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="find-card__body">
        <span className="find-card__title">{find.title}</span>
        <span className="find-card__meta">
          {find.shop || find.type === 'trade' ? '· ' : ''}{find.shop || ''} · {find.city}
          {find.expiresAt ? ` · ${timeLeft(find.expiresAt)}` : ''}
        </span>
        {find.desc ? <p className="find-card__desc">{find.desc}</p> : null}
        <div className="find-card__foot">
          <span className="find-card__user">{user ? user.handle : '@collector'} · {timeAgo(find.at)} ago</span>
          <span className="find-card__price">{find.price ? money(find.price) : 'Swap'}</span>
        </div>
        <div className="find-card__status">
          <Badge tone={status.tone}>{status.label}</Badge>
          <span className="find-card__fresh">Last confirmed {timeAgo(find.confirmedAt || find.at)} ago</span>
        </div>
        <div className="row gap wrap" style={{ marginTop: 8 }}>
          <Button variant="ghost" className="btn--sm">Directions</Button>
          {canManage ? (
            <>
              <Button variant="ghost" className="btn--sm" onClick={() => onStatus && onStatus('active')} title="Mark this find as still on the shelf">
                Still there
              </Button>
              <Button variant="ghost" className="btn--sm" onClick={() => onStatus && onStatus('soldout')} title="Mark this find as sold out">
                Sold out
              </Button>
              <Button className="btn--sm" onClick={grab}>I grabbed it</Button>
            </>
          ) : (
            <>
              {find.type === 'trade' ? (
                <Button className="btn--sm" onClick={() => setShowTrade(true)}>Request trade</Button>
              ) : (
                <Button className="btn--sm" onClick={() => setShowContact(true)}>Message collector</Button>
              )}
            </>
          )}
          <Button variant="ghost" className="btn--sm" onClick={() => setShowReport(true)}>Report</Button>
          <WhatsAppShareButton
            title={`${find.type === 'trade' ? 'Trade' : 'Find'}: ${find.title}${find.city ? ` — ${find.city}` : ''} on Diecet Gardage: `}
            label="Share"
            className="btn--sm"
          />
        </div>
        {isLive && !canManage ? null : <p className="demo-note find-card__note">Status changes are saved in this browser only (demo).</p>}
      </div>
      {showContact ? <ContactModal userId={find.by} title={contactTitle} open={showContact} onClose={() => setShowContact(false)} /> : null}
      {showTrade ? <TradeRequestModal find={find} open={showTrade} onClose={() => setShowTrade(false)} /> : null}
      {showReport ? <ReportModal targetType="find" targetId={find.id} title="Report this find" open={showReport} onClose={() => setShowReport(false)} /> : null}
    </article>
  )
}