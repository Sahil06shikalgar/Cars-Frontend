import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { uid } from './data.js'
import { api, authApi } from '../api/client.js'
import { io } from 'socket.io-client'

const STORAGE_KEY = 'diecast_vault_v1'

// Nothing private is ever seeded or persisted in the browser. Private
// collections start empty and are only filled from the authenticated API.
const emptyState = () => ({
  version: 3,
  models: [],
  wishlist: [],
  finds: [],
  auctions: [],
  posts: [],
  activity: [],
  communities: [],
  conversations: [],
  messagesOpened: 0,
  blogs: [],
})

function clearStoredState() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* storage blocked */ }
}

// ——— server DTO → demo shape (keeps every page reading the same fields) ———

const modelDto = (m) => ({
  id: m.id,
  name: m.name,
  brand: m.brand || '',
  scale: m.scale || '1:64',
  year: m.year || new Date().getFullYear(),
  condition: m.condition || 'Fresh',
  color: m.color || m.brand || '',
  value: m.value || 0,
  rarity: m.rarity || 'Common',
  tags: m.tags || [],
  photoUrl: m.photoUrl || '',
  listed: Boolean(m.listed),
  auctionId: m.auctionId || null,
  added: m.added || Date.now(),
})

const auctionDto = (a) => ({
  id: a.id,
  model: a.model || { name: a.name || 'Die-cast model', brand: '', scale: '1:64', color: '' },
  sellerId: a.sellerId,
  photoUrl: a.photoUrl || '',
  opening: a.opening || Date.now(),
  endsAt: a.endsAt,
  startingBid: a.startingBid,
  buyNow: a.buyNow || 0,
  status: a.status,
  winnerId: a.winnerId || null,
  bids: (a.bids || []).map((b) => ({
    userId: b.userId,
    amount: b.amount,
    at: b.at,
  })),
})

const findDto = (f) => ({
  id: f.id,
  type: f.type === 'trade' ? 'trade' : 'find',
  title: f.title,
  brand: f.brand || 'Any',
  desc: f.desc || '',
  price: f.price || 0,
  shop: f.shop || '',
  city: f.city || '',
  hue: f.hue ?? 20,
  geo: f.geo || f.loc || { lat: 52.52, lng: 13.405 },
  loc: {
    x: f.loc?.x ?? (f.geo ? 50 : 50),
    y: f.loc?.y ?? 50,
    label: f.loc?.label || f.locLabel || f.city || 'Berlin',
  },
  by: f.user?.id || f.by || '',
  at: f.at || f.confirmedAt || Date.now(),
  expiresAt: f.expiresAt || null,
  status: f.status || 'active',
  confirmedAt: f.confirmedAt || Date.now(),
  photoUrl: f.photoUrl || '',
})

const postDto = (p) => ({
  id: p.id,
  authorId: p.authorId,
  community: p.community || 'Berlin Trade Circle',
  content: p.content,
  ts: p.ts,
  likes: p.likes || 0,
  liked: Boolean(p.liked),
  comments: p.comments || 0,
  auctionId: p.auctionId || null,
})

const convoDto = (c) => ({
  id: c.id,
  with: c.with,
  last: c.last || '',
  ts: c.ts,
  tradeRequestId: c.tradeRequestId || null,
})

const blogDto = (b) => ({
  id: b.id,
  slug: b.slug,
  title: b.title,
  excerpt: b.excerpt,
  coverUrl: b.coverUrl || '',
  category: b.category || 'Guides',
  tags: b.tags || [],
  body: Array.isArray(b.body) ? b.body : [],
  readMinutes: b.readMinutes || 3,
  featured: Boolean(b.featured),
  views: b.views || 0,
  authorId: b.authorId,
  author: b.author || null,
  ts: b.ts,
})

const wishDto = (w) => ({
  id: w.id,
  name: w.name,
  brand: w.brand || '',
  scale: w.scale || '1:64',
  note: w.note || '',
  addedAt: w.addedAt || Date.now(),
})

const profileDto = (p) => {
  if (!p) return null
  return {
    id: p.id,
    name: p.name,
    handle: p.handle || `@${p.id}`,
    initials: p.initials || (p.name || '?').slice(0, 2).toUpperCase(),
    color: p.color || '#9aa1ad',
    city: p.city || '—',
    bio: p.bio || '',
    level: p.level || 1,
    xp: p.xp || 0,
    xpMax: p.xpMax || 1000,
    badges: p.badges || [],
    followers: p.followers || 0,
    following: p.following || 0,
    crews: p.crews || 0,
    earned: p.earned || 0,
    stats: p.stats || { models: 0, finds: 0, trades: 0, rating: 0 },
    joined: p.joined || '',
  }
}

export function profileFromUser(user) {
  if (!user) return null
  const s = user.stats || {}
  return {
    id: user.id,
    name: user.name,
    handle: user.handle || `@${user.id}`,
    initials: user.initials || (user.name || '?').slice(0, 2).toUpperCase(),
    color: user.color || '#ff5a3c',
    city: user.city || '—',
    bio: user.bio || '',
    level: user.level || 1,
    xp: user.xp || 0,
    xpMax: 1000,
    badges: user.badges || [],
    followers: 0,
    following: 0,
    crews: 0,
    earned: 0,
    stats: { models: s.models || 0, finds: s.finds || 0, trades: s.trades || 0, rating: s.rating || 0 },
    joined: user.joined || '',
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(emptyState)
  const [session, setSession] = useState({ mode: 'loading', user: null, error: '' })
  const [ready, setReady] = useState(false)
  const [liveEvents, setLiveEvents] = useState([])
  const [commentsByPost, setCommentsByPost] = useState({})
  const [notifications, setNotifications] = useState({ list: [], unread: 0 })
  const profileCache = useRef(new Map())
  const socketRef = useRef(null)

  // Dev-mode convenience: point the app at a local backend by setting
  // VITE_API_URL (no proxy needed). Otherwise the vite proxy serves /api.
  useEffect(() => {
    if (!import.meta.env.VITE_API_URL) return undefined
    globalThis.__API_BASE__ = import.meta.env.VITE_API_URL.replace(/\/$/, '')
    return () => { delete globalThis.__API_BASE__ }
  }, [])

  const cacheProfile = (p) => {
    if (!p || !p.id) return
    profileCache.current.set(String(p.id), profileDto(p))
  }

  // Collect every profile referenced by live data into the cache.
  const indexProfiles = (data) => {
    if (data.auction) cacheProfile(data.auction.seller)
    ;(data.auctions || []).forEach((a) => {
      cacheProfile(a.seller)
      ;(a.bids || []).forEach((b) => cacheProfile(b.user))
    })
    ;(data.finds || []).forEach((f) => cacheProfile(f.user))
    ;(data.posts || []).forEach((p) => {
      if (p.authorId) cacheProfile({ id: p.authorId, name: (p.author && p.author.name) || 'Collector' })
      cacheProfile(p.author)
    })
    ;(data.conversations || []).forEach((c) => cacheProfile(c.user))
    ;(data.wishlist || []).forEach((w) => {
      if (w.matches && w.matches.auction) cacheProfile(w.matches.auction.seller)
    })
  }

  // Public marketplace/community data — safe to load signed in or out.
  const fetchPublic = async () => {
    const [finds, auctions, posts, blogs] = await Promise.all([
      api.get('/finds').catch(() => null),
      api.get('/auctions?status=all').catch(() => null),
      api.get('/posts').catch(() => null),
      api.get('/blogs').catch(() => null),
    ])
    indexProfiles({ auctions: auctions?.auctions, finds: finds?.finds, posts: posts?.posts })
    ;(blogs?.blogs || []).forEach((b) => cacheProfile(b.author))
    setState((s) => ({
      ...s,
      finds: (finds?.finds || []).map(findDto),
      auctions: (auctions?.auctions || []).map(auctionDto),
      posts: (posts?.posts || []).map(postDto),
      blogs: (blogs?.blogs || []).map(blogDto),
    }))
  }

  // Private data — only ever fetched for the authenticated session.
  const fetchPrivate = async () => {
    const [vault, wish, convos] = await Promise.all([
      api.get('/vault').catch(() => null),
      api.get('/wishlist').catch(() => null),
      api.get('/conversations').catch(() => null),
    ])
    setState((s) => ({
      ...s,
      models: (vault?.models || []).map(modelDto),
      wishlist: (wish?.wishlist || []).map(wishDto),
      conversations: (convos?.conversations || []).map(convoDto),
    }))
    await fetchNotifications()
  }

  const fetchAll = async () => {
    await fetchPublic()
    await fetchPrivate()
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications({ list: (res.notifications || []), unread: res.unread || 0 })
    } catch {
      // offline — keep whatever we have
    }
  }

  const boot = async () => {
    // Purge any private data a previous (demo) build cached in this browser.
    clearStoredState()
    try {
      const res = await authApi.me()
      const user = res.user
      cacheProfile(profileFromUser(user))
      setSession({ mode: 'live', user, error: '' })
      await fetchAll()
    } catch {
      // Not signed in (or backend offline): guest gets public pages only.
      setSession({ mode: 'guest', user: null, error: '' })
      await fetchPublic()
    } finally {
      setReady(true)
    }
  }

  useEffect(() => { boot() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Live socket: real-time bids, end-of-auction, new messages, notifications.
  useEffect(() => {
    if (session.mode !== 'live' || !session.user) return undefined
    const origin = globalThis.__API_BASE__ || window.location.origin
    // Identity is proven by the session cookie server-side; the client never
    // sends a userId of its own.
    const socket = io(origin, {
      path: '/socket.io',
      withCredentials: true,
    })
    socketRef.current = socket

    const bumpConversations = () => {
      api.get('/conversations').then((r) => {
        setState((s) => ({ ...s, conversations: (r.conversations || []).map(convoDto) }))
      }).catch(() => {})
    }

    const refreshAuctions = () => {
      api.get('/auctions?status=all').then((r) => {
        indexProfiles({ auctions: r.auctions })
        setState((s) => ({ ...s, auctions: (r.auctions || []).map(auctionDto) }))
      }).catch(() => {})
    }

    socket.on('auction:bid', refreshAuctions)
    socket.on('auction:ended', refreshAuctions)
    socket.on('conversation:message', bumpConversations)
    socket.on('message:new', bumpConversations)
    socket.on('notification', (n) => {
      setLiveEvents((arr) => [n, ...arr].slice(0, 24))
      setNotifications((cur) => ({ list: [n, ...cur.list].slice(0, 40), unread: cur.unread + 1 }))
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [session.mode, session.user?.id])

  const api_ = useMemo(() => {
    const update = (fn) => setState((s) => (typeof fn === 'function' ? fn(s) : { ...s, ...fn }))
    const live = session.mode === 'live'

    const refresh = async (pathList) => {
      const results = await Promise.all(pathList.map((p) => api.get(p).catch(() => null)))
      const refs = { vault: results[0], wish: results[1], finds: results[2], auctions: results[3], posts: results[4], convos: results[5] }
      indexProfiles({ auctions: refs.auctions?.auctions, finds: refs.finds?.finds })
      setState((s) => {
        const next = { ...s }
        if (refs.vault) next.models = (refs.vault.models || []).map(modelDto)
        if (refs.wish) next.wishlist = (refs.wish.wishlist || []).map(wishDto)
        if (refs.finds) next.finds = (refs.finds.finds || []).map(findDto)
        if (refs.auctions) next.auctions = (refs.auctions.auctions || []).map(auctionDto)
        if (refs.posts) next.posts = (refs.posts.posts || []).map(postDto)
        if (refs.convos) next.conversations = (refs.convos.conversations || []).map(convoDto)
        return next
      })
    }

    const togglePostLike = (postId) => {
      const post = state.posts.find((p) => p.id === postId)
      if (live && post) {
        api.post(`/posts/${postId}/like`).then((r) => {
          update((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? { ...p, likes: r.likes, liked: r.liked } : p)) }))
        }).catch(() => {
          update((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? { ...p, liked: !p.liked, likes: Math.max(0, p.likes + (p.liked ? -1 : 1)) } : p)) }))
        })
        return
      }
      update((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, liked: !p.liked, likes: Math.max(0, p.likes + (p.liked ? -1 : 1)) } : p
        ),
      }))
    }

    const addPost = ({ content, community }) => {
      if (live) {
        return api.post('/posts', { content, community })
          .then((r) => { update((s) => ({ ...s, posts: [postDto(r.post), ...s.posts] })); return true })
          .catch(() => false)
      }
      update((s) => ({
        ...s,
        posts: [
          { id: uid('p'), authorId: 'me', community, content, ts: Date.now(), likes: 0, liked: true, comments: 0, auctionId: null },
          ...s.posts,
        ],
      }))
      return true
    }

    const addFind = async ({ type, title, brand, desc, price, shop, city, locLabel, x, y, geo, photoUrl }) => {
      if (live) {
        try {
          const r = await api.post('/finds', {
            type, title, brand, desc, price: Number(price) || 0,
            shop, city,
            loc: { label: locLabel },
            geo: geo || { lat: 52.52, lng: 13.405 },
            photoUrl: photoUrl || '',
          })
          update((s) => ({ ...s, finds: [findDto(r.find), ...s.finds] }))
          return true
        } catch { return false }
      }
      update((s) => ({
        ...s,
        finds: [
          {
            id: uid('f'), type, title, brand: brand || 'Any', desc, price: Number(price) || 0,
            shop: shop || '', city: city || (locLabel || 'Berlin'),
            loc: { x: Number(x) || 50, y: Number(y) || 50, label: locLabel || city || 'Berlin' },
            geo: geo || { lat: 52.52, lng: 13.405 },
            photoUrl: photoUrl || '',
            by: 'me', at: Date.now(), status: 'active', confirmedAt: Date.now(), expiresAt: null,
          },
          ...s.finds,
        ],
      }))
      return true
    }

    const setFindStatus = (findId, status) => {
      if (live) {
        api.patch(`/finds/${findId}`, { status }).then((r) => {
          update((s) => ({
            ...s,
            finds: s.finds.map((f) => (f.id === findId ? { ...f, status: r.find.status, confirmedAt: r.find.confirmedAt } : f)),
          }))
        }).catch(() => {})
        return
      }
      update((s) => ({
        ...s,
        finds: s.finds.map((f) =>
          f.id === findId ? { ...f, status, confirmedAt: Date.now() } : f
        ),
      }))
    }

    const addWishlistItem = ({ name, brand, scale, note }) => {
      if (live) {
        return api.post('/wishlist', { name, brand, scale, note })
          .then((r) => { update((s) => ({ ...s, wishlist: [wishDto(r.item), ...s.wishlist] })); return true })
          .catch(() => false)
      }
      update((s) => ({
        ...s,
        wishlist: [
          {
            id: uid('wl'), name: String(name).trim(), brand: String(brand || '').trim(),
            scale: String(scale || '').trim(), note: String(note || '').trim(),
            addedAt: Date.now(),
          },
          ...s.wishlist,
        ],
      }))
      return true
    }

    const updateWishlistItem = (wishlistId, patch) => {
      if (live) {
        return api.patch(`/wishlist/${wishlistId}`, patch)
          .then((r) => {
            const dto = wishDto(r.item)
            update((s) => ({ ...s, wishlist: s.wishlist.map((w) => (w.id === wishlistId ? dto : w)) }))
            return true
          })
          .catch(() => false)
      }
      update((s) => ({
        ...s,
        wishlist: s.wishlist.map((w) =>
          w.id === wishlistId
            ? { ...w, name: String(patch.name ?? w.name).trim(), brand: String(patch.brand ?? w.brand).trim(), scale: String(patch.scale ?? w.scale).trim(), note: String(patch.note ?? w.note).trim() }
            : w
        ),
      }))
      return true
    }

    const removeWishlistItem = (wishlistId) => {
      if (live) {
        api.del(`/wishlist/${wishlistId}`).then(() => {
          update((s) => ({ ...s, wishlist: s.wishlist.filter((w) => w.id !== wishlistId) }))
        }).catch(() => {})
        return
      }
      update((s) => ({ ...s, wishlist: s.wishlist.filter((w) => w.id !== wishlistId) }))
    }

    const addModel = (model) => {
      if (live) {
        return api.post('/vault', model)
          .then((r) => {
            const dto = modelDto(r.model)
            update((s) => ({ ...s, models: [...s.models, dto] }))
            return true
          })
          .catch(() => false)
      }
      update((s) => ({
        ...s,
        models: [
          ...s.models,
          {
            id: uid('m'), name: model.name, brand: model.brand, scale: model.scale, year: Number(model.year) || new Date().getFullYear(),
            condition: model.condition, color: model.color || model.brand, value: Number(model.value) || 0,
            added: Date.now(), tags: (model.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
            listed: false,
          },
        ],
      }))
      return true
    }

    const addBid = (auctionId, amount) => {
      if (live) {
        return api.post(`/auctions/${auctionId}/bid`, { amount })
          .then((r) => {
            const dto = auctionDto(r.auction)
            update((s) => ({ ...s, auctions: s.auctions.map((a) => (a.id === auctionId ? dto : a)) }))
            return true
          })
          .catch(() => false)
      }
      update((s) => ({
        ...s,
        auctions: s.auctions.map((a) =>
          a.id === auctionId
            ? { ...a, bids: [...a.bids, { userId: 'me', amount: Number(amount), at: Date.now() }] }
            : a
        ),
      }))
      return true
    }

    const buyNow = (auctionId) => {
      if (live) {
        return api.post(`/auctions/${auctionId}/buy`)
          .then((r) => {
            const dto = auctionDto(r.auction)
            update((s) => ({ ...s, auctions: s.auctions.map((a) => (a.id === auctionId ? dto : a)) }))
            return true
          })
          .catch(() => false)
      }
      update((s) => ({
        ...s,
        auctions: s.auctions.map((a) =>
          a.id === auctionId && a.status === 'active'
            ? {
                ...a, status: 'ended', endsAt: Date.now(), winnerId: 'me',
                bids: [...a.bids, { userId: 'me', amount: a.buyNow, at: Date.now() }],
              }
            : a
        ),
      }))
      return true
    }

    const updateModel = (modelId, patch) => {
      if (live) {
        return api.patch(`/vault/${modelId}`, patch)
          .then((r) => {
            const dto = modelDto(r.model)
            update((s) => ({ ...s, models: s.models.map((m) => (m.id === modelId ? dto : m)) }))
            return true
          })
          .catch(() => false)
      }
      update((s) => ({
        ...s,
        models: s.models.map((m) =>
          m.id === modelId
            ? {
                ...m,
                name: patch.name ?? m.name, brand: patch.brand ?? m.brand, scale: patch.scale ?? m.scale,
                year: Number(patch.year) || m.year, condition: patch.condition ?? m.condition,
                color: patch.color ?? m.color, value: patch.value !== undefined ? Number(patch.value) : m.value,
                photoUrl: patch.photoUrl ?? m.photoUrl,
                tags: typeof patch.tags === 'string'
                  ? patch.tags.split(',').map((t) => t.trim()).filter(Boolean)
                  : (patch.tags ?? m.tags),
              }
            : m
        ),
      }))
      return true
    }

    const removeModel = (modelId) => {
      if (live) {
        return api.del(`/vault/${modelId}`)
          .then(() => { update((s) => ({ ...s, models: s.models.filter((m) => m.id !== modelId) })); return true })
          .catch(() => false)
      }
      update((s) => ({ ...s, models: s.models.filter((m) => m.id !== modelId) }))
      return true
    }

    const attachModelPhoto = async (modelId, file) => {
      if (!live) return false
      try {
        const url = await uploadPhoto(file)
        const r = await api.post(`/vault/${modelId}/photo`, { photoUrl: url })
        const dto = modelDto(r.model)
        update((s) => ({ ...s, models: s.models.map((m) => (m.id === modelId ? dto : m)) }))
        return true
      } catch { return false }
    }

    const fetchComments = (postId) => {
      if (live) {
        return api.get(`/posts/${postId}/comments`)
          .then((r) => {
            ;(r.comments || []).forEach((c) => cacheProfile(c.author))
            const list = (r.comments || []).map((c) => ({
              id: c.id || String(c._id || ''),
              authorId: String(c.author?.id || (c.author && c.author._id) || ''),
              author: c.author || null,
              text: c.content || c.text || '',
              at: (c.createdAt ? new Date(c.createdAt).getTime() : Date.now()),
            }))
            setCommentsByPost((map) => ({ ...map, [postId]: list }))
            return list
          })
          .catch(() => [])
      }
      return Promise.resolve(commentsByPost[postId] || [])
    }

    const addComment = (postId, text) => {
      if (live) {
        return api.post(`/posts/${postId}/comments`, { content: text })
          .then((r) => {
            const c = r.comment
            const item = {
              id: c.id,
              author: c.author || null,
              authorId: String(c.author?.id || ''),
              text: c.content || c.text || '',
              at: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
            }
            cacheProfile(c.author)
            setCommentsByPost((map) => ({ ...map, [postId]: [...(map[postId] || []), item] }))
            update((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p)) }))
            return true
          })
          .catch(() => false)
      }
      setCommentsByPost((map) => {
        const item = { id: `c-${Date.now()}`, authorId: 'me', author: { id: 'me', name: 'Ari Voss', handle: '@arivoss', initials: 'AV', color: '#ff5a3c' }, text, at: Date.now() }
        return { ...map, [postId]: [...(map[postId] || []), item] }
      })
      update((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p)) }))
      return true
    }

    const commentList = (postId) => commentsByPost[postId] || []

    const startConversation = (userId, message) => {
      if (live) {
        return api.post('/conversations', { userId, message })
          .then((r) => {
            const dto = convoDto(r.conversation)
            cacheProfile(r.conversation.user)
            update((s) => ({ ...s, conversations: [dto, ...s.conversations.filter((c) => c.id !== dto.id)] }))
            return { ok: true, id: dto.id }
          })
          .catch(() => ({ ok: false }))
      }
      const dto = { id: uid('c'), with: userId, last: message, ts: Date.now(), tradeRequestId: null }
      update((s) => ({ ...s, conversations: [dto, ...s.conversations] }))
      return Promise.resolve({ ok: true, id: dto.id })
    }

    const requestTrade = (findId, message) => {
      if (live) {
        return api.post('/trades', { tradeId: findId, message })
          .then((r) => {
            if (r.request?.trade?.owner) cacheProfile(r.request.trade.owner)
            return { ok: true, ownerId: r.request?.owner?.id || null }
          })
          .catch(() => ({ ok: false }))
      }
      const find = state.finds.find((f) => f.id === findId)
      const dto = { id: uid('c'), with: find ? find.by : null, last: message, ts: Date.now(), tradeRequestId: uid('tr') }
      update((s) => ({ ...s, conversations: [dto, ...s.conversations] }))
      return Promise.resolve({ ok: true, ownerId: find ? find.by : null })
    }

    const report = (targetType, targetId, reason) => {
      if (live) {
        return api.post('/reports', { targetType, targetId, reason })
          .then(() => true)
          .catch(() => false)
      }
      return Promise.resolve(true)
    }

    const updateProfile = async (patch) => {
      if (!live) return false
      try {
        const r = await authApi.update(patch)
        cacheProfile(profileFromUser(r.user))
        setSession((s) => ({ ...s, user: r.user }))
        return true
      } catch { return false }
    }

    const markAllNotificationsRead = () => {
      if (!live) return
      api.post('/notifications/read-all').then(() => {
        setNotifications((cur) => ({ ...cur, unread: 0, list: cur.list.map((n) => ({ ...n, read: true })) }))
      }).catch(() => {})
    }

    const listForAuction = ({ modelId, startingBid, buyNow, durationHours }) => {
      if (live) {
        const model = state.models.find((m) => m.id === modelId)
        return api.post('/auctions', {
          sourceModelId: modelId,
          model: model
            ? { name: model.name, brand: model.brand, scale: model.scale, color: model.color || model.brand }
            : undefined,
          startingBid: Number(startingBid) || 10,
          buyNow: Number(buyNow) || 0,
          endsAt: new Date(Date.now() + Number(durationHours) * 3600 * 1000).toISOString(),
        })
          .then((r) => {
            const dto = auctionDto(r.auction)
            update((s) => ({
              ...s,
              auctions: [dto, ...s.auctions],
              models: s.models.map((m) => (m.id === modelId ? { ...m, listed: true, auctionId: dto.id } : m)),
            }))
            return true
          })
          .catch(() => false)
      }
      update((s) => {
        const model = s.models.find((m) => m.id === modelId)
        if (!model || model.listed) return s
        const auction = {
          id: uid('a'),
          model: { name: model.name, brand: model.brand, scale: model.scale, color: model.color || model.brand },
          sellerId: 'me', opening: Date.now(), endsAt: Date.now() + Number(durationHours) * 3600 * 1000,
          startingBid: Number(startingBid) || 10, buyNow: Number(buyNow) || 0,
          status: 'active', winnerId: null, bids: [],
        }
        return {
          ...s,
          auctions: [auction, ...s.auctions],
          models: s.models.map((m) => (m.id === modelId ? { ...m, listed: true, auctionId: auction.id } : m)),
        }
      })
      return true
    }

    const endAuction = (auctionId) => {
      if (live) {
        api.post(`/auctions/${auctionId}/close`).then((r) => {
          const dto = auctionDto(r.auction)
          update((s) => ({ ...s, auctions: s.auctions.map((a) => (a.id === auctionId ? dto : a)) }))
        }).catch(() => {})
        return
      }
      update((s) => ({
        ...s,
        auctions: s.auctions.map((a) => (a.id === auctionId ? { ...a, status: 'ended', endsAt: Date.now() } : a)),
      }))
    }

    const setWinner = (auctionId, winnerId) => {
      if (live) {
        if (!winnerId) return
        api.post(`/auctions/${auctionId}/close`).then(() => refresh([null, null, null, '/auctions?status=all'])).catch(() => {})
        return
      }
      update((s) => ({
        ...s,
        auctions: s.auctions.map((a) =>
          a.id === auctionId && a.status === 'ended'
            ? { ...a, winnerId: winnerId || null }
            : a
        ),
      }))
    }

    const toggleJoin = (communityId) =>
      update((s) => ({
        ...s,
        communities: s.communities.map((g) =>
          g.id === communityId ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g
        ),
      }))

    // Fetch the full article (bumps the read counter server-side) and merge it
    // back into the store so the detail page and the list stay in sync.
    const refreshBlog = (slug) => {
      return api.get(`/blogs/${slug}`)
        .then((r) => {
          const dto = blogDto(r.blog)
          update((s) => ({ ...s, blogs: s.blogs.map((b) => (b.slug === slug ? dto : b)) }))
          return dto
        })
        .catch(() => null)
    }

    const openMessages = () => update((s) => ({ ...s, messagesOpened: (s.messagesOpened || 0) + 1 }))

    // ——— session helpers ———
    const login = async (email, password) => {
      setSession((s) => ({ ...s, error: '' }))
      const res = await authApi.login(email, password)
      cacheProfile(profileFromUser(res.user))
      setSession({ mode: 'live', user: res.user, error: '' })
      await fetchAll()
      return res.user
    }

    const signup = async (name, email, password) => {
      setSession((s) => ({ ...s, error: '' }))
      const res = await authApi.signup(name, email, password)
      cacheProfile(profileFromUser(res.user))
      setSession({ mode: 'live', user: res.user, error: '' })
      await fetchAll()
      return res.user
    }

    // Drop every trace of the signed-in user the moment they log out.
    const logout = async () => {
      try { await authApi.logout() } catch { /* offline — still drop the session */ }
      clearStoredState()
      profileCache.current.clear()
      setNotifications({ list: [], unread: 0 })
      setCommentsByPost({})
      setLiveEvents([])
      setSession({ mode: 'guest', user: null, error: '' })
      setState(emptyState())
      await fetchPublic()
    }

    const sendMessage = async (conversationId, text) => {
      if (!live) return false
      try {
        await api.post(`/conversations/${conversationId}/messages`, { text })
        const convos = await api.get('/conversations')
        update((s) => ({ ...s, conversations: (convos.conversations || []).map(convoDto) }))
        return true
      } catch { return false }
    }

    const uploadPhoto = async (file) => {
      if (!live) throw new Error('Sign in to upload photos.')
      const res = await api.upload('/upload', file)
      return res.photo.url
    }

    return {
      state,
      session,
      ready,
      liveEvents,
      notifications: notifications.list,
      notifyUnread: notifications.unread,
      commentsByPost,
      // Null whenever nobody is signed in — no demo profile is ever shown.
      currentUser: session.user ? profileFromUser(session.user) : null,
      collectorById: (id) => (id ? profileCache.current.get(String(id)) || null : null),
      isLive: live,
      isMe: (id) => (session.user ? String(id) === String(session.user.id) : false),
      refresh,
      login,
      signup,
      logout,
      sendMessage,
      startConversation,
      requestTrade,
      uploadPhoto,
      updateProfile,
      report,
      markAllNotificationsRead,
      fetchComments,
      commentList,
      addComment,
      togglePostLike,
      addPost,
      addFind,
      setFindStatus,
      addWishlistItem,
      updateWishlistItem,
      removeWishlistItem,
      addModel,
      updateModel,
      removeModel,
      attachModelPhoto,
      addBid,
      buyNow,
      listForAuction,
      endAuction,
      setWinner,
      toggleJoin,
      openMessages,
      refreshBlog,
    }
  }, [state, session, ready, liveEvents, notifications, commentsByPost])

  return <StoreContext.Provider value={api_}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}