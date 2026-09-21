import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { Button, Card, Field, DemoNote, EmptyState } from '../components/ui.jsx'
import { AppBar } from '../components/AppBar.jsx'
import { Tabs } from '../components/Tabs.jsx'
import { ActivityItem } from '../components/ActivityItem.jsx'
import { PostCard } from '../components/PostCard.jsx'
import { MessageIcon, SendIcon, UsersIcon, CompassIcon, PlusIcon } from '../components/icons.jsx'
import { ListForAuctionModal } from '../components/forms.jsx'

function Composer({ onSubmit }) {
  const [content, setContent] = useState('')
  const [community, setCommunity] = useState('Berlin Trade Circle')
  const { state } = useStore()
  const submit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit({ content: content.trim(), community })
    setContent('')
  }
  return (
    <Card className="composer" data-reveal>
      <form onSubmit={submit}>
        <Field label="What's on your desk?" htmlFor="composer-text">
          <textarea
            id="composer-text"
            className="input textarea"
            rows={3}
            placeholder="Share a pickup, a swap story or ask the community… (demo)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Field>
        <div className="row gap between wrap spacer-top">
          <select className="input input--sm" aria-label="Post to community"
            value={community} onChange={(e) => setCommunity(e.target.value)}>
            {state.communities.map((g) => <option key={g.id}>{g.name}</option>)}
          </select>
          <Button type="submit" disabled={!content.trim()}><SendIcon size={15} /> Post</Button>
        </div>
      </form>
    </Card>
  )
}

function CommunityCard({ group, onJoin }) {
  return (
    <Card className="community-card">
      <div className="row gap">
        <span className="community-card__avatar" aria-hidden="true">{group.name.slice(0, 2).toUpperCase()}</span>
        <div>
          <div className="community-card__name">{group.name}</div>
          <p>{group.members.toLocaleString('en')} members · {group.tag}</p>
        </div>
      </div>
      <Button variant={group.joined ? 'ghost' : 'primary'} full className="btn--sm" onClick={() => onJoin(group.id)}>
        {group.joined ? 'Joined' : 'Join'}
      </Button>
    </Card>
  )
}

export function FeedPage() {
  const { state, collectorById, addPost, togglePostLike, toggleJoin, isLive } = useStore()
  const navigate = useNavigate()
  const requireLogin = () => navigate('/login', { state: { from: '/feed' } })
  const [tab, setTab] = useState('explore')
  const [communityFilter, setCommunityFilter] = useState('All')
  const [justPosted, setJustPosted] = useState(null)
  const [showSell, setShowSell] = useState(false)

  const pageRef = useRef(null)
  useScrollReveal(pageRef, [tab])

  const communities = useMemo(
    () => [...new Set(state.posts.map((p) => p.community))],
    [state.posts]
  )

  const posts = state.posts.filter((p) => communityFilter === 'All' || p.community === communityFilter)

  // Selling needs an account — bounce guests to sign-in, then open the
  // same guarded list-for-auction flow used by the Auctions page.
  const openSell = () => {
    if (!isLive) { navigate('/login', { state: { from: '/feed' } }); return }
    setShowSell(true)
  }

  return (
    <>
      <AppBar
        eyebrow="Diecast Vault"
        title="Feed"
        actions={
          <>
            <button type="button" className="appbar__action appbar__action--primary" onClick={openSell}>
              <PlusIcon size={15} /> Sell your car
            </button>
            <Link className="appbar__action" to="/messages">
              <MessageIcon size={15} /> Messages
            </Link>
          </>
        }
      />

      <div className="page" ref={pageRef}>
        <div className="page-intro" data-reveal>
          <span className="eyebrow">Community</span>
          <h1 className="page-intro__title">The collector's feed</h1>
          <p className="page-intro__sub">
            Live finds, swap stories and headlines from collectors across our regions.
          </p>
        </div>

        <Tabs
          full
          tabs={[
            { id: 'explore', label: 'Explore' },
            { id: 'community', label: 'Community', count: state.communities.length },
          ]}
          active={tab}
          onChange={setTab}
          label="Feed sections"
        />

        {tab === 'explore' ? (
          <div className="section">
            <div className="section__head">
              <h2>Live feed</h2>
              <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span className="live-dot" aria-hidden="true" /> Real-time demo
              </span>
            </div>
            {state.activity.length === 0 ? (
              <EmptyState icon={<CompassIcon size={28} />} title="Nothing happening yet" text="New bids, listings and grabs will appear here." />
            ) : (
              <div className="activity-list" data-reveal="stagger">
                {state.activity.map((item) => <ActivityItem key={item.id} item={item} />)}
              </div>
            )}
          </div>
        ) : (
          <div className="section">
            {justPosted ? <p className="toast" role="status">{justPosted}</p> : null}

            {isLive ? (
              <Composer onSubmit={async (post) => {
                const ok = await addPost(post)
                setJustPosted(ok
                  ? 'Your post is live and saved to your account.'
                  : 'Your post could not be published — please retry.')
              }} />
            ) : (
              <Card className="composer" data-reveal>
                <p className="muted" style={{ fontSize: 13 }}>
                  <Link className="link" to="/login">Sign in</Link> to post, like and comment.
                </p>
              </Card>
            )}

            <div className="row gap wrap" role="group" aria-label="Filter feed by community">
              <button
                type="button"
                className={`chip ${communityFilter === 'All' ? 'chip--active' : ''}`.trim()}
                aria-pressed={communityFilter === 'All'}
                onClick={() => setCommunityFilter('All')}
              >All</button>
              {communities.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${communityFilter === c ? 'chip--active' : ''}`.trim()}
                  aria-pressed={communityFilter === c}
                  onClick={() => setCommunityFilter(c)}
                >{c}</button>
              ))}
            </div>

            <div className="post-list" aria-label="Activity feed" data-reveal="stagger">
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  author={collectorById(p.authorId) || { name: 'Collector', handle: '@collector', initials: 'CL', color: '#9aa1ad' }}
                  onLike={isLive ? togglePostLike : requireLogin}
                />
              ))}
            </div>

            <div className="section" style={{ marginTop: 6 }}>
              <div className="section__head">
                <h2>Communities</h2>
                <UsersIcon size={16} className="muted" />
              </div>
              <div className="community-grid" data-reveal="stagger">
                {state.communities.map((g) => (
                  <CommunityCard key={g.id} group={g} onJoin={toggleJoin} />
                ))}
              </div>
            </div>

            <DemoNote />
          </div>
        )}
      </div>

      {isLive ? <ListForAuctionModal open={showSell} onClose={() => setShowSell(false)} preselectedId="" /> : null}
    </>
  )
}
