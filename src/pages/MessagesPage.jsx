import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { timeAgo } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { Avatar, DemoNote } from '../components/ui.jsx'
import { AppBar } from '../components/AppBar.jsx'
import { SendIcon } from '../components/icons.jsx'
import { api } from '../api/client.js'

function seedThread(convo) {
  return [
    { id: 's1', me: false, text: convo.last },
    { id: 's2', me: true, text: 'Sounds good — I can hold it until the weekend. (demo)' },
    { id: 's3', me: false, text: 'Perfect. Bring the carded one too and we can compare.' },
  ]
}

export function MessagesPage() {
  const { state, collectorById, sendMessage, isLive, session } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeId, setActiveId] = useState(state.conversations[0]?.id || null)
  const [threads, setThreads] = useState({})
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const pageRef = useRef(null)
  useScrollReveal(pageRef)

  // "Message me" links open a specific conversation via ?open=<id>.
  useEffect(() => {
    const open = searchParams.get('open')
    if (open && state.conversations.some((c) => c.id === open)) {
      setActiveId(open)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, state.conversations, setSearchParams])

  const active = state.conversations.find((c) => c.id === activeId) || null
  const other = active ? collectorById(active.with) : null

  // Load real message history for the active conversation when signed in.
  useEffect(() => {
    let cancelled = false
    if (!active || !isLive) return undefined
    api.get(`/conversations/${active.id}/messages`)
      .then((res) => {
        if (cancelled) return
        setThreads((t) => ({
          ...t,
          [active.id]: (res.messages || []).map((m) => ({
            id: m.id,
            me: String(m.senderId) === String(session.user?.id),
            text: m.text,
          })),
        }))
      })
      .catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isLive, session.user?.id])

  const messages = active ? (threads[active.id] || seedThread(active)) : []

  const send = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !active || sending) return
    const text = draft.trim()

    if (isLive) {
      setDraft('')
      setSending(true)
      const ok = await sendMessage(active.id, text)
      setSending(false)
      if (!ok) {
        setThreads((t) => ({ ...t, [active.id]: [...(t[active.id] || []), { id: `m-${Date.now()}`, me: true, text: 'Could not send — please retry.' }] }))
      }
      return
    }

    setThreads((t) => ({
      ...t,
      [active.id]: [...(t[active.id] || seedThread(active)), { id: `m-${Date.now()}`, me: true, text }],
    }))
    setDraft('')
  }

  return (
    <>
      <AppBar eyebrow="Diecast Vault" title="Messages" back="/feed" />

      <div className="page" ref={pageRef}>
        <div className="msg-layout">
          <div className="msg-list" aria-label="Conversations" data-reveal="stagger">
            {state.conversations.length === 0 ? (
              <p className="muted" style={{ padding: '16px 8px', fontSize: 13 }}>
                {isLive ? 'No conversations yet.' : 'No conversations yet — messages start from a trade request or a listing.'}
              </p>
            ) : null}
            {state.conversations.map((c) => {
              const user = collectorById(c.with)
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`msg-item ${c.id === activeId ? 'msg-item--active' : ''}`.trim()}
                  onClick={() => setActiveId(c.id)}
                >
                  <Avatar user={user} size={44} />
                  <span className="msg-item__main">
                    <b>{user ? user.name : 'Collector'}</b>
                    <p>{c.last}</p>
                  </span>
                  <span className="msg-item__time">{timeAgo(c.ts)}</span>
                </button>
              )
            })}
          </div>

          {other ? (
            <div className="msg-thread" data-reveal>
              <div className="msg-thread__head">
                <Avatar user={other} size={40} />
                <div>
                  <b>{other.name}</b>
                  <p className="muted" style={{ fontSize: 12 }}>{other.handle} · {other.city}</p>
                </div>
              </div>

              <div className="msg-bubbles">
                {messages.length === 0 ? (
                  <p className="muted" style={{ fontSize: 13, padding: 12 }}>No messages yet — say hello.</p>
                ) : messages.map((m) => (
                  <div key={m.id} className={`msg-bubble ${m.me ? 'msg-bubble--me' : ''}`.trim()}>{m.text}</div>
                ))}
              </div>

              <form className="msg-composer" onSubmit={send}>
                <input
                  className="input"
                  placeholder={isLive ? 'Write a message…' : 'Write a message (demo)…'}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Write a message"
                />
                <button type="submit" className="btn btn--primary" disabled={!draft.trim() || sending} aria-label="Send message">
                  <SendIcon size={16} />
                </button>
              </form>
            </div>
          ) : null}
        </div>

        <DemoNote>
          {isLive
            ? 'Messages are stored in your account and pushed live over the socket connection when the other collector replies.'
            : 'Messages are illustrative only — nothing is delivered outside this browser.'}
        </DemoNote>
      </div>
    </>
  )
}