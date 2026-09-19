import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { MAP_CENTER } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { MapCanvas } from '../components/MapCanvas.jsx'
import { MapMarker } from '../components/MapMarker.jsx'
import { FindCard } from '../components/FindCard.jsx'
import { Tabs } from '../components/Tabs.jsx'
import { AddFindModal } from '../components/forms.jsx'
import { PlusIcon, TrophyIcon, SparkIcon, LocateIcon } from '../components/icons.jsx'

const initialsOf = (text = '') =>
  text.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase().slice(0, 3) || '1:64'

const fmt = (value) => value?.toFixed(5) ?? '—'

export function FindsPage() {
  const { state, collectorById, setFindStatus, isLive, isMe } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('find')
  const [open, setOpen] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [notice, setNotice] = useState('')
  const [tracking, setTracking] = useState(false)
  const [recenter, setRecenter] = useState(0)
  const [loc, setLoc] = useState({ phase: 'idle', pos: null, msg: '' })

  const pageRef = useRef(null)
  useScrollReveal(pageRef)

  const finds = useMemo(() => state.finds.filter((f) => f.type === tab), [state.finds, tab])
  const activeCount = finds.filter((f) => (f.status || 'active') === 'active').length

  const markers = finds.map((f) => (
    <MapMarker
      key={f.id}
      geo={f.geo}
      label={f.type === 'trade' ? 'Trade' : (f.brand || 'Find')}
      accent={f.type === 'trade' ? 'trade' : 'red'}
      initials={initialsOf(f.brand)}
      hue={f.hue ?? 20}
      done={f.status && f.status !== 'active'}
    />
  ))

  const onLocStatus = useCallback((phase, pos, msg = '') => {
    setLoc((cur) => ({ ...cur, phase, pos: pos || cur.pos, msg }))
    if (phase === 'error') setTracking(false)
  }, [])

  const toggleTracking = () => {
    if (tracking || loc.phase === 'locating') {
      setTracking(false)
      setLoc({ phase: 'idle', pos: null, msg: '' })
    } else {
      setLoc({ phase: 'locating', pos: null, msg: '' })
      setTracking(true)
    }
  }

  const statusText =
    loc.phase === 'locating'
      ? 'Finding your location…'
      : loc.phase === 'tracking'
        ? `Live · ${fmt(loc.pos?.lat)}, ${fmt(loc.pos?.lng)} · ±${Math.round(loc.pos?.accuracy ?? 0)} m`
        : loc.phase === 'error'
          ? loc.msg
          : ''

  const statusKind = loc.phase === 'tracking' ? 'ok' : loc.phase === 'error' ? 'err' : ''

  const messages = {
    active: (title) => `Marked “${title}” as still there — last confirmed just now.`,
    soldout: (title) => `Marked “${title}” as sold out — it's dimmed on the map now.`,
    grabbed: (title) => `Marked “${title}” as grabbed (demo).`,
  }

  const setStatus = (find, status) => {
    setFindStatus(find.id, status)
    setNotice(messages[status](find.title))
    window.setTimeout(() => setNotice(''), 2400)
  }

  return (
    <div className="map-page" ref={pageRef}>
      <MapCanvas
        center={MAP_CENTER}
        markers={markers}
        tracking={tracking}
        recenterSignal={recenter}
        onStatus={onLocStatus}
      />

      <div className="map-overlay">
        <div className="map-overlay__top">
          <div className="map-overlay__left" data-reveal="stagger">
            <div className="map-panel">
              <span className="live-tag">Live now</span>
              <h1 className="map-panel__title">Finds Map</h1>
              <p className="map-panel__sub">{finds.length} posts · {activeCount} on the shelf · expire in 24h</p>
            </div>
            <Tabs
              variant="float"
              tabs={[
                { id: 'find', label: 'Finds' },
                { id: 'trade', label: 'Trades' },
              ]}
              active={tab}
              onChange={setTab}
              label="Map layer"
            />
          </div>

          <div className="map-overlay__right" data-reveal="stagger">
            <div className="trophy-counter" aria-label="Trophy count: 0">
              <TrophyIcon size={19} />
              <span className="trophy-counter__value">0</span>
            </div>
            <button
              type="button"
              className="fab"
              aria-label="Post a find"
              onClick={() => (isLive ? setShowAdd(true) : navigate('/login', { state: { from: '/finds' } }))}
            >
              <PlusIcon size={24} />
            </button>
          </div>
        </div>

        <div className="map-overlay__mid" data-reveal="stagger">
          {statusText ? (
            <p className={`loc-status${statusKind ? ` loc-status--${statusKind}` : ''}`} role="status">
              {statusText}
            </p>
          ) : null}

          <button
            type="button"
            className={`loc-btn${tracking ? ' loc-btn--active' : ''}${loc.phase === 'locating' ? ' loc-btn--busy' : ''}`}
            onClick={toggleTracking}
          >
            <span className="loc-btn__dot" aria-hidden="true" />
            {tracking
              ? loc.phase === 'locating'
                ? 'Locating…'
                : 'Stop tracking'
              : loc.phase === 'error'
                ? 'Try again'
                : 'Use my location'}
          </button>

          {tracking && loc.phase === 'tracking' ? (
            <button type="button" className="loc-recenter" onClick={() => setRecenter((n) => n + 1)}>
              <LocateIcon size={13} />
              Recenter
            </button>
          ) : null}
        </div>

        <div className={`sheet ${open ? 'sheet--open' : ''}`}>
          <span className="sheet__handle" aria-hidden="true" />
          <div className="sheet__head">
            <span className="sheet__title">
              {tab === 'find' ? 'Live finds' : 'Open trades'}
              <span className="sheet__count">{finds.length}</span>
            </span>
            <button type="button" className="sheet__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              {open ? 'Collapse' : 'Expand'}
              <SparkIcon size={13} />
            </button>
          </div>

          {notice ? <p className="toast" role="status" style={{ margin: '0 18px 10px' }}>{notice}</p> : null}

          <div className="sheet__body">
            <div className="find-list">
              {finds.map((f) => (
                <FindCard
                  key={f.id}
                  find={f}
                  user={collectorById(f.by)}
                  onStatus={(status) => setStatus(f, status)}
                  canManage={isLive && isMe(f.by)}
                  isLive={isLive}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAdd && isLive ? (
        <AddFindModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          geo={loc.pos ? { lat: loc.pos.lat, lng: loc.pos.lng } : null}
        />
      ) : null}
    </div>
  )
}

export default FindsPage