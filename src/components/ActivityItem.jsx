import { useStore } from '../store/useStore.jsx'
import { timeAgo, money, brandColorOf } from '../store/data.js'
import { Rarity } from './ui.jsx'
import {
  GavelIcon, TagIcon, MapPinIcon, MessageIcon, UsersIcon, HeartIcon, SparkIcon,
} from './icons.jsx'

const META = {
  bid: { icon: GavelIcon, tone: 'bid' },
  flex: { icon: SparkIcon, tone: 'flex' },
  listing: { icon: TagIcon, tone: 'listing' },
  grab: { icon: MapPinIcon, tone: 'grab' },
  comment: { icon: MessageIcon, tone: 'comment' },
  community: { icon: UsersIcon, tone: 'community' },
}

function Nudge() {
  return (
    <button type="button" className="activity__nudge" aria-label="Nudge (demo)">
      <HeartIcon size={13} /> Nudge
    </button>
  )
}

export function ActivityItem({ item }) {
  const { collectorById } = useStore()
  const user = collectorById(item.userId)
  const meta = META[item.type] || META.community
  const Icon = meta.icon

  if (item.type === 'flex') {
    return (
      <div className="activity">
        <span
          className="activity__icon"
          style={{ background: `linear-gradient(150deg, ${brandColorOf(item.brand)}, #121722)`, color: '#fff' }}
          aria-hidden="true"
        >
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.04em' }}>
            {item.brand.slice(0, 3).toUpperCase()}
          </span>
        </span>
        <div className="activity__main">
          <p className="activity__text"><b>{user.name}</b> added <b>{item.model}</b></p>
          <p className="activity__sub">{item.brand} · {item.year} · {item.scale} · {timeAgo(item.ts)} ago</p>
        </div>
        <div className="activity__end">
          <Rarity tier={item.rarity} />
          <span className="activity__amount">{money(item.value)}</span>
        </div>
      </div>
    )
  }

  let text = null
  let end = <Nudge />

  if (item.type === 'bid') {
    text = <><b>{user.name}</b> placed a bid on <b>{item.target}</b></>
    end = (
      <>
        <span className="activity__amount">{money(item.amount)}</span>
        <Nudge />
      </>
    )
  } else if (item.type === 'listing') {
    text = <><b>{user.name}</b> listed <b>{item.target}</b> from {money(item.starting)}</>
  } else if (item.type === 'grab') {
    text = <><b>{user.name}</b> grabbed a find at <b>{item.target}</b>, {item.city}</>
  } else if (item.type === 'comment') {
    text = <><b>{user.name}</b> commented on <b>{item.target}</b></>
  } else {
    text = <><b>{user.name}</b> posted in the community</>
  }

  return (
    <div className="activity">
      <span className={`activity__icon activity__icon--${meta.tone}`} aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="activity__main">
        <p className="activity__text">{text}</p>
        <p className="activity__sub">{user.handle} · {timeAgo(item.ts)} ago</p>
      </div>
      <div className="activity__end">{end}</div>
    </div>
  )
}
