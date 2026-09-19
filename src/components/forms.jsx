import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { Button, Field, DemoNote, EmptyState } from './ui.jsx'
import { Modal } from './Modal.jsx'
import { ModelThumb } from './ModelThumb.jsx'
import { CameraIcon, TagIcon, TrashIcon } from './icons.jsx'

const brands = [
  'Hot Wheels', 'Mini GT', 'BBR', 'AUTOart', 'Inno64', 'Tarmac Works', 'Ebbro',
]
const scales = ['1:18', '1:43', '1:64']
const conditions = ['Carded', 'Fresh', 'Display', 'Used']

export function AddModelModal({ open, onClose }) {
  const { addModel, isLive } = useStore()
  const [form, setForm] = useState({
    name: '', brand: brands[0], scale: '1:64', year: 2024, condition: 'Fresh',
    color: '', value: 20, tags: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setErr('')
    const ok = await addModel(form)
    if (!ok) { setErr(isLive ? 'Could not add the model — are you signed in?' : 'Could not add the model right now.'); return }
    setMsg(isLive ? `${form.name} added to your vault and saved to your account.` : `${form.name} added to your vault (demo).`)
    setForm((f) => ({ ...f, name: '', color: '', tags: '' }))
  }

  return (
    <Modal open={open} title="Add model to vault" onClose={onClose} footer={<DemoNote />}>
      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? <p className="form-error" role="alert">{err}</p> : null}
      <form className="form" onSubmit={submit}>
        <Field label="Model name" htmlFor="am-name">
          <input id="am-name" className="input" required placeholder="Porsche 930 Turbo" value={form.name} onChange={set('name')} />
        </Field>
        <div className="form__grid2">
          <Field label="Brand" htmlFor="am-brand">
            <select id="am-brand" className="input" value={form.brand} onChange={set('brand')}>
              {brands.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Scale" htmlFor="am-scale">
            <select id="am-scale" className="input" value={form.scale} onChange={set('scale')}>
              {scales.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Year" htmlFor="am-year">
            <input id="am-year" type="number" min={1950} max={2030} className="input" value={form.year} onChange={set('year')} />
          </Field>
          <Field label="Condition" htmlFor="am-cond">
            <select id="am-cond" className="input" value={form.condition} onChange={set('condition')}>
              {conditions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Colour" htmlFor="am-color">
            <input id="am-color" className="input" placeholder="Guards Red" value={form.color} onChange={set('color')} />
          </Field>
          <Field label="Market value (€)" htmlFor="am-value">
            <input id="am-value" type="number" min={0} className="input" value={form.value} onChange={set('value')} />
          </Field>
        </div>
        <Field label="Tags (comma separated)" htmlFor="am-tags">
          <input id="am-tags" className="input" placeholder="JDM, Carded" value={form.tags} onChange={set('tags')} />
        </Field>
        <div className="row end" style={{ marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" full={false}>Add to vault</Button>
        </div>
      </form>
    </Modal>
  )
}

export function WishlistModal({ open, onClose, initial }) {
  const { addWishlistItem, updateWishlistItem, isLive } = useStore()
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, brand: initial.brand, scale: initial.scale, note: initial.note || '' }
      : { name: '', brand: brands[0], scale: '1:64', note: '' }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setErr('')
    let ok = true
    if (initial) {
      ok = await updateWishlistItem(initial.id, form)
      if (ok) setMsg(`${form.name} updated on your wishlist.`)
    } else {
      ok = await addWishlistItem(form)
      if (ok) setMsg(isLive ? `${form.name} added to your wishlist and saved to your account.` : `${form.name} added to your wishlist (saved in this browser).`)
    }
    if (!ok) setErr(isLive ? 'Could not save — are you signed in?' : 'Could not save right now.')
    if (ok) setForm((f) => ({ ...f, name: '' }))
  }

  return (
    <Modal open={open} title={initial ? 'Edit wishlist item' : 'Add to wishlist'} onClose={onClose} footer={<DemoNote />}>
      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? <p className="form-error" role="alert">{err}</p> : null}
      <form className="form" onSubmit={submit}>
        <Field label="Model name" htmlFor="wl-name">
          <input id="wl-name" className="input" required placeholder="Porsche 930 Turbo" value={form.name} onChange={set('name')} />
        </Field>
        <div className="form__grid2">
          <Field label="Brand" htmlFor="wl-brand">
            <input id="wl-brand" className="input" list="wl-brands" placeholder="Mini GT" value={form.brand} onChange={set('brand')} />
            <datalist id="wl-brands">
              {brands.map((b) => <option key={b} value={b} />)}
            </datalist>
          </Field>
          <Field label="Scale" htmlFor="wl-scale">
            <select id="wl-scale" className="input" value={form.scale} onChange={set('scale')}>
              {scales.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Note (optional)" htmlFor="wl-note">
          <input id="wl-note" className="input" placeholder="Target price, source, condition…" value={form.note} onChange={set('note')} />
        </Field>
        <div className="row end" style={{ marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save changes' : 'Track model'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function ListForAuctionModal({ open, onClose, preselectedId }) {
  const { state, listForAuction, isLive } = useStore()
  const available = state.models.filter((m) => !m.listed)
  const [form, setForm] = useState({
    modelId: preselectedId || '',
    startingBid: 20, buyNow: 0, durationHours: 72,
  })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.modelId) return
    const model = state.models.find((m) => m.id === form.modelId)
    setErr('')
    const ok = await listForAuction({ ...form, modelId: form.modelId })
    if (!ok) { setErr(isLive ? 'Could not start the auction — are you signed in?' : 'Could not start the auction right now.'); return }
    setMsg(isLive
      ? `${model.name} is now live for ${Number(form.durationHours)}h — see the BIDS tab.`
      : `${model.name} is now live for ${Number(form.durationHours)}h — see the BIDS tab (demo).`)
    setForm((f) => ({ ...f, modelId: '' }))
  }

  return (
    <Modal open={open} title="List model for auction" onClose={onClose} footer={<DemoNote />}>
      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? <p className="form-error" role="alert">{err}</p> : null}
      {available.length === 0 ? (
        <EmptyState
          icon={<TagIcon size={28} />}
          title="Nothing free to list"
          text="Every model you own already has an active listing. End an auction on the BIDS tab to free a model."
        />
      ) : (
        <form className="form" onSubmit={submit}>
          <Field label="Choose a model (only unlisted ones)" htmlFor="la-model">
            <select id="la-model" className="input" required value={form.modelId} onChange={set('modelId')}>
              <option value="">Select model…</option>
              {available.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.brand} {m.scale}</option>
              ))}
            </select>
          </Field>
          <div className="picker">
            {available.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`picker-item ${form.modelId === m.id ? 'picker-item--active' : ''}`.trim()}
                onClick={() => setForm((f) => ({ ...f, modelId: m.id }))}
                aria-pressed={form.modelId === m.id}
              >
                <ModelThumb name={m.name} brand={m.brand} scale={m.scale} className="picker-item__thumb" />
                <span className="picker-item__name">{m.name}</span>
                <span className="muted">{m.brand} · {m.scale}</span>
              </button>
            ))}
          </div>
          <div className="form__grid2">
            <Field label="Starting bid (€)" htmlFor="la-start">
              <input id="la-start" type="number" min={1} className="input" required value={form.startingBid} onChange={set('startingBid')} />
            </Field>
            <Field label="Buy now (€, optional)" htmlFor="la-buynow">
              <input id="la-buynow" type="number" min={0} className="input" value={form.buyNow} onChange={set('buyNow')} />
            </Field>
          </div>
          <Field label="Duration" htmlFor="la-dur">
            <select id="la-dur" className="input" value={form.durationHours} onChange={set('durationHours')}>
              <option value={24}>24 hours</option>
              <option value={72}>3 days</option>
              <option value={168}>7 days</option>
            </select>
          </Field>
          <div className="row end" style={{ marginTop: 8 }}>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Start auction{isLive ? '' : ' (demo)'}</Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

// ——— photo upload (live only: uploads to the backend, then stores the URL) ———

export function PhotoUpload({ label = 'Photo', value = '', onChange, hint }) {
  const { isLive, uploadPhoto } = useStore()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const inputRef = useRef(null)

  const pick = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    setErr('')
    setBusy(true)
    try {
      const url = await uploadPhoto(file)
      onChange(url)
    } catch (reason) {
      setErr(reason instanceof Error && reason.message ? reason.message : 'Could not upload the photo.')
    } finally {
      setBusy(false)
    }
  }

  if (!isLive) {
    return (
      <div className="photo-upload photo-upload--locked" aria-label={label}>
        <CameraIcon size={16} />
        <span>Sign in to upload photos</span>
      </div>
    )
  }

  return (
    <div className="photo-upload">
      {value ? (
        <div className="photo-upload__preview">
          <img src={value} alt={label} />
          <Button variant="ghost" type="button" className="btn--sm" onClick={() => onChange('')}>Remove</Button>
        </div>
      ) : (
        <button type="button" className="photo-upload__drop" onClick={() => inputRef.current?.click()}>
          <CameraIcon size={18} />
          {busy ? 'Uploading…' : `Add ${label.toLowerCase()}`}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={pick} />
      {err ? <p className="form-error">{err}</p> : null}
      {hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  )
}

// ——— post a find (live posts to the API; demo adds locally) ———

const findBrands = ['Any', 'Hot Wheels', 'Mini GT', 'BBR', 'AUTOart', 'Inno64', 'Tarmac Works', 'Ebbro', 'Solido']

export function AddFindModal({ open, onClose, geo }) {
  const { addFind, isLive } = useStore()
  const [form, setForm] = useState({
    type: 'find', title: '', brand: 'Any', desc: '',
    price: 0, shop: '', city: '', photoUrl: '',
  })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const reset = () => setForm({ type: 'find', title: '', brand: 'Any', desc: '', price: 0, shop: '', city: '', photoUrl: '' })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setErr('')
    const ok = await addFind({ ...form, geo: geo || null, locLabel: form.city })
    if (!ok) { setErr(isLive ? 'Could not post — are you signed in?' : 'Could not post right now.'); return }
    const kind = form.type === 'trade' ? 'Trade offer' : 'Find'
    setMsg(`${kind} “${form.title}” is live${isLive ? ' and saved to your account' : ' on your map (demo)'}.`)
    reset()
  }

  return (
    <Modal open={open} title="Post a find" onClose={onClose} footer={<DemoNote />}>
      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? <p className="form-error" role="alert">{err}</p> : null}
      <form className="form" onSubmit={submit}>
        <div className="form__grid2">
          <Field label="Type" htmlFor="af-type">
            <select id="af-type" className="input" value={form.type} onChange={set('type')}>
              <option value="find">Find on the shelf</option>
              <option value="trade">Looking to trade</option>
            </select>
          </Field>
          <Field label="Brand" htmlFor="af-brand">
            <input id="af-brand" className="input" list="af-brands" value={form.brand} onChange={set('brand')} />
            <datalist id="af-brands">
              {findBrands.map((b) => <option key={b} value={b} />)}
            </datalist>
          </Field>
        </div>
        <Field label={form.type === 'trade' ? 'What do you have?' : 'What did you spot?'} htmlFor="af-title">
          <input id="af-title" className="input" required placeholder="Hot Wheels 240Z Safari" value={form.title} onChange={set('title')} />
        </Field>
        <Field label="Notes" htmlFor="af-desc">
          <textarea id="af-desc" className="input textarea" rows={2} placeholder="Condition, location on the shelf, asking trade…" value={form.desc} onChange={set('desc')} />
        </Field>
        <div className="form__grid2">
          <Field label={form.type === 'trade' ? 'Retail value (€)' : 'Price (€, 0 if unknown)'} htmlFor="af-price">
            <input id="af-price" type="number" min={0} className="input" value={form.price} onChange={set('price')} />
          </Field>
          <Field label={form.type === 'trade' ? 'City' : 'Shop'} htmlFor="af-shop">
            <input id="af-shop" className="input" placeholder={form.type === 'trade' ? 'Berlin' : 'Toys R Us, ringcenter'} value={form.shop} onChange={set('shop')} />
          </Field>
        </div>
        <Field label="City / area" htmlFor="af-city">
          <input id="af-city" className="input" placeholder="Berlin" value={form.city} onChange={set('city')} />
        </Field>
        <PhotoUpload label="Photo" value={form.photoUrl} onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))} hint="Optional — attach a photo of the find." />
        {geo ? (
          <p className="field__hint" style={{ marginTop: 4 }}>
            📍 Dropped at your current location
          </p>
        ) : null}
        <div className="row end" style={{ marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{form.type === 'trade' ? 'Post trade offer' : 'Post find'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ——— edit / delete a vault model ———

export function EditModelModal({ model, open, onClose }) {
  const { updateModel, removeModel, isLive } = useStore()
  const [form, setForm] = useState(() => model
    ? {
        name: model.name, brand: model.brand, scale: model.scale, year: model.year,
        condition: model.condition, color: model.color, value: model.value,
        tags: (model.tags || []).join(', '), photoUrl: model.photoUrl || '',
      }
    : null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (!model) return null
  const active = form || {
    name: model.name, brand: model.brand, scale: model.scale, year: model.year,
    condition: model.condition, color: model.color, value: model.value,
    tags: (model.tags || []).join(', '), photoUrl: model.photoUrl || '',
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!active.name.trim()) return
    setErr('')
    const ok = await updateModel(model.id, active)
    if (!ok) { setErr(isLive ? 'Could not save — are you signed in?' : 'Could not save right now.'); return }
    setMsg('Changes saved to your vault.')
  }

  const remove = async () => {
    if (!window.confirm(`Remove “${model.name}” from your vault? This cannot be undone.`)) return
    setErr('')
    const ok = await removeModel(model.id)
    if (ok) onClose()
    else setErr('Could not remove the model.')
  }

  return (
    <Modal open={open} title="Edit model" onClose={onClose} footer={<DemoNote />}>
      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? <p className="form-error" role="alert">{err}</p> : null}
      <form className="form" onSubmit={submit}>
        <PhotoUpload label="Photo" value={active.photoUrl} onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))} hint="Frame your model against a plain background." />
        <Field label="Model name" htmlFor="em-name">
          <input id="em-name" className="input" required value={active.name} onChange={set('name')} />
        </Field>
        <div className="form__grid2">
          <Field label="Brand" htmlFor="em-brand">
            <select id="em-brand" className="input" value={active.brand} onChange={set('brand')}>
              {brands.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Scale" htmlFor="em-scale">
            <select id="em-scale" className="input" value={active.scale} onChange={set('scale')}>
              {scales.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Year" htmlFor="em-year">
            <input id="em-year" type="number" min={1950} max={2030} className="input" value={active.year} onChange={set('year')} />
          </Field>
          <Field label="Condition" htmlFor="em-cond">
            <select id="em-cond" className="input" value={active.condition} onChange={set('condition')}>
              {conditions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Colour" htmlFor="em-color">
            <input id="em-color" className="input" value={active.color} onChange={set('color')} />
          </Field>
          <Field label="Market value (€)" htmlFor="em-value">
            <input id="em-value" type="number" min={0} className="input" value={active.value} onChange={set('value')} />
          </Field>
        </div>
        <Field label="Tags (comma separated)" htmlFor="em-tags">
          <input id="em-tags" className="input" value={active.tags} onChange={set('tags')} />
        </Field>
        <div className="row between spacer-top">
          <Button variant="danger" type="button" onClick={remove}><TrashIcon size={14} /> Remove</Button>
          <div className="row gap">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ——— start a conversation with a collector ———

export function ContactModal({ userId, title, open, onClose }) {
  const { startConversation, isLive } = useStore()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!message.trim() || !userId) return
    setErr('')
    setBusy(true)
    const res = await startConversation(userId, message.trim())
    setBusy(false)
    if (!res.ok) { setErr(isLive ? 'Could not start the conversation.' : 'Could not start the conversation right now.'); return }
    navigate(`/messages?open=${res.id}`)
    onClose()
  }

  return (
    <Modal open={open} title={title || 'Message collector'} onClose={onClose} footer={<DemoNote />}>
      <form className="form" onSubmit={submit}>
        <Field label="Your message" htmlFor="cm-text">
          <textarea id="cm-text" className="input textarea" rows={3} required placeholder="Hi! I saw your post — " value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        {err ? <p className="form-error" role="alert">{err}</p> : null}
        <div className="row end" style={{ marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy || !message.trim()}>{busy ? 'Sending…' : 'Send & open chat'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ——— request a trade against a trade find ———

export function TradeRequestModal({ find, open, onClose }) {
  const { requestTrade, isLive } = useStore()
  const [message, setMessage] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setErr('')
    setBusy(true)
    const res = await requestTrade(find.id, message.trim())
    setBusy(false)
    if (!res.ok) { setErr(isLive ? 'Could not send the trade request.' : 'Could not send the trade request right now.'); return }
    setMsg(`Trade request sent to the collector${isLive ? ' — they will get a notification and can accept to open a chat.' : ' (demo — a chat was added).'}`)
    setMessage('')
  }

  return (
    <Modal open={open} title={`Request “${find?.title || 'this trade'}”`} onClose={onClose} footer={<DemoNote />}>
      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? <p className="form-error" role="alert">{err}</p> : null}
      <form className="form" onSubmit={submit}>
        <Field label="What would you offer in return?" htmlFor="tr-text">
          <textarea id="tr-text" className="input textarea" rows={3} required placeholder="I can trade a NIB Greenlight…" value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <div className="row end" style={{ marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy || !message.trim()}>{busy ? 'Sending…' : 'Send request'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ——— report a find / post / auction ———

const reportReasons = ['Wrong information', 'Already sold / sold out', 'Offensive or spam content', 'Suspicious behaviour', 'Other']

export function ReportModal({ targetType, targetId, title, open, onClose }) {
  const { report, isLive } = useStore()
  const [reason, setReason] = useState(reportReasons[0])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    const ok = await report(targetType, targetId, reason)
    if (!ok) { setErr(isLive ? 'Could not submit the report — are you signed in?' : 'Could not submit the report right now.'); return }
    setMsg('Thanks — the team will take a look.')
    window.setTimeout(onClose, 1200)
  }

  return (
    <Modal open={open} title={title || 'Report this'} onClose={onClose}>
      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? <p className="form-error" role="alert">{err}</p> : null}
      <form className="form" onSubmit={submit}>
        <Field label="Reason" htmlFor="rp-reason">
          <select id="rp-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
            {reportReasons.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <div className="row end" style={{ marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Send report</Button>
        </div>
      </form>
    </Modal>
  )
}
