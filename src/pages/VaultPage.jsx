import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { money, wishlistMatches, timeAgo } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import {
  Button, Chip, CountUp, DemoNote, EmptyState, ProgressBar, SectionTitle, StatTile, Avatar, Rarity,
  Field, Badge,
} from '../components/ui.jsx'
import { AppBar } from '../components/AppBar.jsx'
import { Tabs } from '../components/Tabs.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { ModelCard } from '../components/ModelCard.jsx'
import { AddModelModal, EditModelModal, ListForAuctionModal, WishlistModal } from '../components/forms.jsx'
import { WishlistCard } from '../components/WishlistCard.jsx'
import {
  BoxIcon, PlusIcon, UserIcon, UsersIcon, StarIcon, AwardIcon, TrendingUpIcon,
  WalletIcon, BellIcon, SettingsIcon, LockIcon, HeartIcon, EditIcon, LogOutIcon, CheckIcon,
} from '../components/icons.jsx'

const scales = ['All', '1:18', '1:43', '1:64']

function Collection({ models, onOpen, onSell, onEdit }) {
  if (models.length === 0) {
    return <EmptyState icon={<BoxIcon size={28} />} title="No models match" text="Try a different search or scale filter." />
  }
  return (
    <div className="model-grid" data-reveal="stagger">
      {models.map((m) => (
        <ModelCard key={m.id} model={m} onOpen={() => onOpen(m)} onSell={() => onSell(m)} onEdit={() => onEdit?.(m)} />
      ))}
    </div>
  )
}

function ProfileEditor({ user, onSaved }) {
  const { updateProfile, isLive } = useStore()
  const [form, setForm] = useState(() => ({
    name: user.name || '', handle: user.handle?.replace('@', '') || '', city: user.city || '', bio: user.bio || '',
  }))
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (!isLive) {
    return (
      <div className="card" data-reveal>
        <span className="eyebrow">Collector profile</span>
        <p className="me-bio" style={{ marginTop: 8 }}>{user.bio}</p>
        <p className="field__hint" style={{ marginTop: 10 }}>Sign in to edit your profile and see your own stats.</p>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    const ok = await updateProfile({
      name: form.name.trim(),
      handle: form.handle.trim().replace(/^@/, ''),
      city: form.city.trim(),
      bio: form.bio.trim(),
    })
    if (!ok) { setErr('Could not save your profile.'); return }
    setMsg('Profile saved to your account.')
    if (onSaved) onSaved()
  }

  return (
    <div className="card" data-reveal>
      <span className="eyebrow">Edit profile</span>
      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? <p className="form-error" role="alert">{err}</p> : null}
      <form className="form" onSubmit={submit} style={{ marginTop: 10 }}>
        <div className="form__grid2">
          <Field label="Name" htmlFor="pe-name">
            <input id="pe-name" className="input" value={form.name} onChange={set('name')} />
          </Field>
          <Field label="Handle" htmlFor="pe-handle">
            <input id="pe-handle" className="input" value={form.handle} onChange={set('handle')} />
          </Field>
        </div>
        <Field label="City" htmlFor="pe-city">
          <input id="pe-city" className="input" value={form.city} onChange={set('city')} />
        </Field>
        <Field label="Bio" htmlFor="pe-bio">
          <textarea id="pe-bio" className="input textarea" rows={2} value={form.bio} onChange={set('bio')} />
        </Field>
        <div className="row end spacer-top">
          <Button type="submit"><CheckIcon size={15} /> Save profile</Button>
        </div>
      </form>
    </div>
  )
}

function NotificationsPanel({ list, unread, onMarkAll }) {
  if (list.length === 0) {
    return (
      <div className="card" data-reveal>
        <SectionTitle title="Notifications" aside={unread ? <Badge tone="red">{unread}</Badge> : null} />
        <p className="muted" style={{ fontSize: 13 }}>New messages, bids and trade replies will appear here live.</p>
      </div>
    )
  }
  return (
    <div className="card" data-reveal>
      <div className="row between">
        <SectionTitle title="Notifications" aside={unread ? <Badge tone="red">{unread} new</Badge> : <span className="muted">All read</span>} />
      </div>
      <div className="notif-list">
        {list.slice(0, 12).map((n) => (
          <div key={n.id} className={`notif-row ${n.read ? '' : 'notif-row--unread'}`.trim()}>
            <span className="notif-row__dot" aria-hidden="true" />
            <span className="notif-row__text">{n.text}</span>
            <span className="muted" style={{ fontSize: 11 }}>{timeAgo(n.ts)} ago</span>
          </div>
        ))}
      </div>
      {unread ? (
        <Button variant="ghost" className="btn--sm spacer-top" onClick={onMarkAll}><CheckIcon size={14} /> Mark all read</Button>
      ) : null}
    </div>
  )
}

function Me({ user, isLive, onLogout, onProfileSaved, notifications, unread, onMarkAll }) {
  return (
    <div className="me-panel">
      <div className="card" data-reveal>
        <span className="eyebrow">Collector profile</span>
        <p className="me-bio" style={{ marginTop: 8 }}>{user.bio}</p>
        <div className="stat-grid" style={{ marginTop: 14 }}>
          <StatTile label="City" value={user.city} icon={<UserIcon size={15} />} />
          <StatTile label="Joined" value={user.joined} icon={<StarIcon size={15} />} />
          <StatTile label="Rating" value={user.stats.rating} icon={<StarIcon size={15} />} />
        </div>
      </div>

      <ProfileEditor user={user} onSaved={onProfileSaved} />

      {isLive ? <NotificationsPanel list={notifications} unread={unread} onMarkAll={onMarkAll} /> : null}

      <div className="section">
        <SectionTitle title="Badges" aside={<span className="muted">{user.badges.length} earned</span>} />
        <div className="badge-row" data-reveal="stagger">
          {user.badges.map((b) => (
            <Rarity key={b} tier={b} />
          ))}
        </div>
      </div>

      <div className="section">
        <SectionTitle title="Account" />
        <div className="stack" data-reveal="stagger">
          {isLive ? (
            <div className="setting-row">
              <span className="setting-row__icon"><EditIcon size={18} /></span>
              <span className="setting-row__main"><b>Signed in</b><span>Your vault and stats are stored in your account</span></span>
              <Button variant="danger" className="btn--sm" onClick={onLogout}><LogOutIcon size={14} /> Sign out</Button>
            </div>
          ) : (
            <div className="setting-row">
              <span className="setting-row__icon"><LockIcon size={18} /></span>
              <span className="setting-row__main"><b>Demo mode</b><span>Sample data saved in this browser</span></span>
            </div>
          )}
          <div className="setting-row">
            <span className="setting-row__icon"><BellIcon size={18} /></span>
            <span className="setting-row__main"><b>Notifications</b><span>Drop alerts and bid updates</span></span>
          </div>
          <div className="setting-row">
            <span className="setting-row__icon"><AwardIcon size={18} /></span>
            <span className="setting-row__main"><b>Collector level</b><span>Level {user.level} · {user.xp} XP</span></span>
          </div>
          <div className="setting-row">
            <span className="setting-row__icon"><SettingsIcon size={18} /></span>
            <span className="setting-row__main"><b>Preferences</b><span>Currency, units and feed content</span></span>
          </div>
        </div>
      </div>

      <DemoNote />
    </div>
  )
}

export function VaultPage({ initialTab = 'collection' }) {
  const {
    state, currentUser, removeWishlistItem, isLive, logout, session,
    notifications, notifyUnread, markAllNotificationsRead,
  } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState(initialTab)
  const [query, setQuery] = useState('')
  const [scale, setScale] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [showList, setShowList] = useState(false)
  const [showWish, setShowWish] = useState(false)
  const [editingWish, setEditingWish] = useState(null)
  const [editingModel, setEditingModel] = useState(null)
  const [preselectId, setPreselectId] = useState('')

  const pageRef = useRef(null)
  useScrollReveal(pageRef, [tab])

  const wishMatches = useMemo(
    () => state.wishlist.map((item) => ({ item, matches: wishlistMatches(item, state) })),
    [state]
  )

  const filtered = useMemo(
    () =>
      state.models.filter((m) => {
        const q = query.trim().toLowerCase()
        const okQuery =
          !q || [m.name, m.brand, m.scale, m.condition, m.color, ...(m.tags || [])].join(' ').toLowerCase().includes(q)
        const okScale = scale === 'All' || m.scale === scale
        return okQuery && okScale
      }),
    [state.models, query, scale]
  )

  const collectionValue = state.models.reduce((sum, m) => sum + (m.value || 0), 0)
  const topCar = state.models.reduce((top, m) => (m.value > (top?.value || 0) ? m : top), null)

  const openSell = (model) => {
    setPreselectId(model.id)
    setShowList(true)
  }

  const openWishAdd = () => {
    setEditingWish(null)
    setShowWish(true)
  }

  const openWishEdit = (item) => {
    setEditingWish(item)
    setShowWish(true)
  }

  const openEditModel = (model) => {
    setEditingModel(model)
  }

  const signOut = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <>
      <AppBar
        eyebrow="Diecast Vault"
        title="My Garage"
        actions={
          <>
            <span className={`account-chip ${isLive ? 'account-chip--live' : ''}`}>
              <span className="account-chip__dot" aria-hidden="true" />
              {isLive ? currentUser.name : 'Demo'}
            </span>
            <button
              type="button"
              className="appbar__action appbar__action--primary"
              onClick={() => (tab === 'wishlist' ? openWishAdd() : setShowAdd(true))}
            >
              {tab === 'wishlist' ? <HeartIcon size={15} filled /> : <PlusIcon size={15} />}
              {tab === 'wishlist' ? 'Track' : 'Add'}
            </button>
          </>
        }
      />

      <div className="page" ref={pageRef}>
        <section className="profile-summary" data-reveal>
          <div className="profile-summary__top">
            <Avatar user={currentUser} size={52} />
            <div className="profile-summary__id">
              <div className="profile-summary__name">{currentUser.name}</div>
              <div className="profile-summary__handle">{currentUser.handle} · {currentUser.city}</div>
              <span className="profile-summary__level"><AwardIcon size={12} /> Level {currentUser.level} Collector</span>
            </div>
            <div className="profile-summary__stats">
              <StatTile label="Models" value={<CountUp value={state.models.length} />} icon={<BoxIcon size={14} />} />
              <StatTile label="Followers" value={<CountUp value={currentUser.followers} />} icon={<UsersIcon size={14} />} />
              <StatTile label="Following" value={<CountUp value={currentUser.following} />} icon={<UserIcon size={14} />} />
              <StatTile label="Crews" value={<CountUp value={currentUser.crews} />} icon={<UsersIcon size={14} />} />
            </div>
          </div>
          <ProgressBar
            value={currentUser.xp}
            max={currentUser.xpMax}
            left={`Level ${currentUser.level}`}
            right={`${currentUser.xp} / ${currentUser.xpMax} XP`}
          />
        </section>

        <section className="stats-row" data-reveal>
          <div className="stats-row__cell stats-row__cell--main">
            <span className="stats-row__label">Vault value</span>
            <span className="stats-row__value"><CountUp value={collectionValue} format={(v) => money(v)} duration={900} /></span>
          </div>
          <div className="stats-row__cell">
            <span className="stats-row__label">This month</span>
            <span className="stats-row__delta"><TrendingUpIcon size={13} /> +12.4%</span>
          </div>
          <div className="stats-row__cell">
            <span className="stats-row__label">Models</span>
            <span className="stats-row__num"><CountUp value={state.models.length} /></span>
          </div>
          <div className="stats-row__cell">
            <span className="stats-row__label">Top car</span>
            <span className="stats-row__num">{topCar ? <CountUp value={topCar.value} format={(v) => money(v)} /> : '—'}</span>
          </div>
          <div className="stats-row__cell">
            <span className="stats-row__label">Earned</span>
            <span className="stats-row__num"><CountUp value={currentUser.earned} format={(v) => money(v)} /></span>
          </div>
        </section>

        <Tabs
          tabs={[
            { id: 'collection', label: 'Collection', count: state.models.length },
            { id: 'wishlist', label: 'Wishlist', count: state.wishlist.length },
            { id: 'me', label: 'Me' },
          ]}
          active={tab}
          onChange={setTab}
          label="Vault sections"
        />

        {tab === 'collection' ? (
          <div className="section">
            <div className="vault-tools">
              <SearchBar value={query} onChange={setQuery} placeholder="Search your models…" label="Search your model collection" />
              <div className="row gap wrap" role="group" aria-label="Filter by scale">
                {scales.map((s) => (
                  <Chip key={s} active={scale === s} onClick={() => setScale(s)}>{s}</Chip>
                ))}
              </div>
            </div>
            <Collection
              models={filtered}
              onOpen={(m) => navigate(`/car/${m.id}`)}
              onSell={openSell}
              onEdit={openEditModel}
            />
            <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <WalletIcon size={14} /> {state.models.length} models · collection value ≈ {money(collectionValue)}
            </p>
          </div>
        ) : tab === 'wishlist' ? (
          <div className="section">
            <SectionTitle
              title="Wishlist"
              aside={<span className="muted">{state.wishlist.length} tracked</span>}
            />
            {wishMatches.length === 0 ? (
              <EmptyState
                icon={<HeartIcon size={28} />}
                title="Nothing tracked yet"
                text="Tap “Track” to add a model by name, brand and scale. If it shows up in a find or live auction later, you'll see the match here."
                action={
                  <div className="row center" style={{ marginTop: 10 }}>
                    <Button variant="primary" onClick={openWishAdd}>Track a model</Button>
                  </div>
                }
              />
            ) : (
              <div className="wish-grid" data-reveal="stagger">
                {wishMatches.map(({ item, matches }) => (
                  <WishlistCard
                    key={item.id}
                    item={item}
                    matches={matches}
                    onEdit={openWishEdit}
                    onRemove={(i) => removeWishlistItem(i.id)}
                  />
                ))}
              </div>
            )}
            <DemoNote className="wish-note">
              Your wishlist is private and saved in this browser only — match badges update as finds and auctions change locally. No data leaves your device.
            </DemoNote>
          </div>
        ) : (
          <Me
            key={isLive ? session.user?.id || 'live' : 'demo'}
            user={currentUser}
            isLive={isLive}
            onLogout={signOut}
            onProfileSaved={null}
            notifications={notifications}
            unread={notifyUnread}
            onMarkAll={markAllNotificationsRead}
          />
        )}
      </div>

      <AddModelModal open={showAdd} onClose={() => setShowAdd(false)} />
      <EditModelModal
        key={editingModel ? editingModel.id : 'none'}
        model={editingModel}
        open={Boolean(editingModel)}
        onClose={() => setEditingModel(null)}
      />
      <ListForAuctionModal
        key={preselectId || 'none'}
        open={showList}
        onClose={() => setShowList(false)}
        preselectedId={preselectId}
      />
      <WishlistModal
        key={editingWish ? editingWish.id : 'new'}
        open={showWish}
        onClose={() => setShowWish(false)}
        initial={editingWish}
      />
    </>
  )
}
