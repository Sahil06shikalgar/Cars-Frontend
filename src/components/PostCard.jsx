import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Badge } from './ui.jsx'
import { timeAgo, brandColorOf } from '../store/data.js'
import { useStore } from '../store/useStore.jsx'
import { HeartIcon, MessageIcon, ArrowUpRightIcon } from './icons.jsx'
import { ReportModal } from './forms.jsx'

function Comments({ postId }) {
  const { commentList, fetchComments, addComment } = useStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && !loaded) {
      await fetchComments(postId)
      setLoaded(true)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!draft.trim() || busy) return
    setBusy(true)
    const ok = await addComment(postId, draft.trim())
    setBusy(false)
    if (ok) setDraft('')
  }

  const list = commentList(postId)

  return (
    <div className="post-comments">
      <button type="button" className="post-meta post-comments__toggle" onClick={toggle} aria-expanded={open}>
        <MessageIcon size={15} /> {open ? 'Hide' : 'View'} comments...
      </button>
      {open ? (
        <div className="post-comments__body">
          {list.length === 0 ? (
            <p className="muted" style={{ fontSize: 12, padding: '4px 0' }}>No comments yet — be the first to reply.</p>
          ) : (
            list.map((c) => (
              <div key={c.id} className="post-comment">
                <Avatar user={c.author ? { name: c.author.name, initials: c.author.initials, color: c.author.color } : null} size={28} />
                <div className="post-comment__main">
                  <b>{c.author ? c.author.name : 'Collector'}</b>
                  <span>{c.text}</span>
                </div>
              </div>
            ))
          )}
          <form className="post-comment-form" onSubmit={submit}>
            <input
              className="input"
              placeholder="Write a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Write a comment"
            />
            <button type="submit" className="btn btn--primary btn--sm" disabled={!draft.trim() || busy}>
              {busy ? '…' : 'Reply'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export function PostCard({ post, author, onLike }) {
  const [showReport, setShowReport] = useState(false)
  return (
    <article className="card post-card">
      <div className="post-card__head">
        <Avatar user={author} size={40} />
        <div className="post-card__who">
          <b>{author.name}</b>
          <span className="muted">{author.handle} · {timeAgo(post.ts)} ago</span>
        </div>
        {post.community ? <Badge tone="blue">{post.community}</Badge> : null}
      </div>

      <p className="post-card__text">{post.content}</p>

      {post.auctionId ? (
        <div className="post-listing" style={{ borderColor: brandColorOf('Mini GT') }}>
          <div
            className="post-listing__thumb"
            role="img"
            aria-label="Linked auction item illustrated card"
            style={{ background: `linear-gradient(145deg, ${brandColorOf('Mini GT')}, #161b26)` }}
          >
            AUCTION
          </div>
          <div>
            <b>Live auction link</b>
            <p className="muted">This post links to a live demo auction. Tap to review and bid.</p>
          </div>
          <Link className="btn btn--ghost btn--sm" to="/auctions">
            Open BIDS <ArrowUpRightIcon size={14} />
          </Link>
        </div>
      ) : null}

      <div className="post-card__foot">
        <button
          type="button"
          className={`post-like ${post.liked ? 'post-like--on' : ''}`.trim()}
          onClick={() => onLike(post.id)}
          aria-pressed={post.liked}
          aria-label={`${post.liked ? 'Unlike' : 'Like'} post by ${author.name}`}
        >
          <HeartIcon size={16} filled={post.liked} />
          {post.likes}
        </button>
        <span className="post-meta"><MessageIcon size={15} /> {post.comments} comments</span>
        <button type="button" className="post-meta post-card__report" onClick={() => setShowReport(true)}>Report</button>
      </div>

      <Comments postId={post.id} />

      {showReport ? <ReportModal targetType="post" targetId={post.id} title="Report this post" open={showReport} onClose={() => setShowReport(false)} /> : null}
    </article>
  )
}
