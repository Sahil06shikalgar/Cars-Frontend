import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { money, modelScore } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { Badge, Button, DemoNote, EmptyState, Rarity, SectionTitle } from '../components/ui.jsx'
import { AppBar } from '../components/AppBar.jsx'
import { CarViewer } from '../components/CarViewer.jsx'
import { ModelCard } from '../components/ModelCard.jsx'
import { ListForAuctionModal } from '../components/forms.jsx'
import { BoxIcon, TagIcon, ClockIcon, TrendingUpIcon } from '../components/icons.jsx'
import { WhatsAppShareButton } from '../components/WhatsApp.jsx'

export function CarDetailPage() {
  const { id } = useParams()
  const { state } = useStore()
  const navigate = useNavigate()
  const [showList, setShowList] = useState(false)
  const pageRef = useRef(null)
  useScrollReveal(pageRef, [id])
  const model = state.models.find((m) => m.id === id)

  if (!model) {
    return (
      <>
        <AppBar eyebrow="Diecast Vault" title="Not found" back="/" />
        <div className="page">
          <EmptyState
            icon={<BoxIcon size={28} />}
            title="Model not found"
            text="This casting is not in your vault (demo)."
            action={<Link className="btn btn--ghost" to="/">Back to vault</Link>}
          />
        </div>
      </>
    )
  }

  const related = state.models.filter((m) => m.id !== model.id).slice(0, 4)

  return (
    <>
      <AppBar eyebrow="Diecast Vault" title={model.name} back="/" />

      <div className="page detail-page" ref={pageRef}>
        <div className="detail" data-reveal>
          <div className="detail__media">
            <CarViewer name={model.name} brand={model.brand} className="detail__hero" data-parallax="30" />
            <div className="detail__value">
              <div>
                <span className="portfolio__label">Market value</span>
                <b>{money(model.value)}</b>
              </div>
              <Badge tone="orange">Score {modelScore(model)}</Badge>
            </div>
          </div>

          <div className="detail__info">
            <div className="detail__badges">
              {model.rarity ? <Rarity tier={model.rarity} /> : null}
              <Badge tone="neutral">{model.scale}</Badge>
              <Badge tone={model.condition === 'Carded' ? 'green' : 'blue'}>{model.condition}</Badge>
              {model.listed ? <Badge tone="red">In auction</Badge> : <Badge tone="gold">In vault</Badge>}
            </div>

            <div>
              <h2 className="detail__title">{model.name}</h2>
              <p className="detail__brand">{model.brand} · {model.year} · {model.scale}</p>
            </div>

            <ul className="detail__facts" data-reveal="stagger">
              <li className="fact"><span>Year</span><b>{model.year}</b></li>
              <li className="fact"><span>Colour</span><b>{model.color}</b></li>
              <li className="fact"><span>Condition</span><b>{model.condition}</b></li>
              <li className="fact"><span>Added</span><b>{new Date(model.added).toLocaleDateString('en-GB')}</b></li>
            </ul>

            {model.tags?.length ? (
              <div className="detail__tags">
                {model.tags.map((t) => <span key={t} className="badge badge--neutral">{t}</span>)}
              </div>
            ) : null}

            <div className="detail__actions">
              <Button onClick={() => setShowList(true)} disabled={model.listed}>
                <TagIcon size={15} /> {model.listed ? 'Already listed' : 'List for auction'}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')}>Back to vault</Button>
              <WhatsAppShareButton
                title={`${model.name} ${model.brand} · ${model.scale} — my Diecet Gardage vault: `}
                label=""
                iconOnly
              />
            </div>

            {model.listed ? (
              <p className="banner">This model already has a live listing — no second auction is allowed.</p>
            ) : null}
            <DemoNote />
          </div>
        </div>

        {related.length ? (
          <div className="section">
            <SectionTitle title="More from your vault" aside={<Link className="section__link" to="/">View all</Link>} />
            <div className="model-grid" data-reveal="stagger">
              {related.map((m) => (
                <ModelCard
                  key={m.id}
                  model={m}
                  onOpen={() => navigate(`/car/${m.id}`)}
                  onSell={() => navigate('/')}
                />
              ))}
            </div>
          </div>
        ) : null}

        <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <ClockIcon size={14} /> In vault since {new Date(model.added).toLocaleDateString('en-GB')} · <TrendingUpIcon size={14} /> +12.4% this month
        </p>
      </div>

      <ListForAuctionModal open={showList} onClose={() => setShowList(false)} preselectedId={model.id} />
    </>
  )
}
