export const MIN = 60 * 1000
export const HOUR = 60 * MIN
export const DAY = 24 * HOUR

export const now = () => Date.now()
export const minutesAgo = (m) => now() - m * MIN
export const hoursFromNow = (h) => now() + h * HOUR
export const daysAgo = (d) => now() - d * DAY
export const daysFromNow = (d) => now() + d * DAY

let counter = 100
export const uid = (prefix) => `${prefix}-${++counter}`

export const money = (n) => `${Number(n).toFixed(0)} €`

export function timeAgo(ts) {
  const diff = now() - ts
  if (diff < 60 * 1000) return 'now'
  const mins = Math.floor(diff / MIN)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export function timeLeft(endsAt) {
  const diff = endsAt - now()
  if (diff <= 0) return 'Ended'
  const mins = Math.floor(diff / MIN)
  if (mins < 60) return `${mins}m left`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ${mins % 60}m left`
  const days = Math.floor(hrs / 24)
  return `${days}d ${hrs % 24}h left`
}

export const currentBidOf = (auction) =>
  auction.bids.length ? Math.max(...auction.bids.map((b) => b.amount)) : auction.startingBid

export const bidCountOf = (auction) => auction.bids.length

// When `meId` is provided (a signed-in user id) matches are compared against it,
// otherwise it assumes the legacy demo "me" shorthand.
export const isMine = (value, meId) =>
  meId ? String(value) === String(meId) : value === 'me'

export const collectors = [
  { id: 'me', name: 'Ari Voss', handle: '@arivoss', city: 'Berlin', color: '#ff5a3c', initials: 'AV',
    bio: 'JDM + vintage carded hunter. Demo profile.', joined: 'Mar 2021',
    level: 12, xp: 720, xpMax: 1000, followers: 1284, following: 1, crews: 1, earned: 0,
    badges: ['Early Bird', 'Case Breaker', 'Swap Pro'],
    stats: { models: 12, finds: 18, trades: 7, rating: 4.9 } },
  { id: 'c1', name: 'Nina Kowalski', handle: '@ninak', city: 'Rotterdam', color: '#2e9fff',
    initials: 'NK', bio: '1:64 & 1:43 swaps.', stats: { models: 40, finds: 22, trades: 31, rating: 5.0 } },
  { id: 'c2', name: 'Tom Becker', handle: '@tombecker', city: 'Munich', color: '#a06bff',
    initials: 'TB', bio: 'Rally era fan.', stats: { models: 28, finds: 11, trades: 9, rating: 4.8 } },
  { id: 'c3', name: 'Inês Marques', handle: '@inesboxed', city: 'Lisbon', color: '#ffc24b',
    initials: 'IM', bio: 'Carded only, always.', stats: { models: 65, finds: 34, trades: 5, rating: 4.9 } },
  { id: 'c4', name: 'Leo Okafor', handle: '@leowheels', city: 'London', color: '#2fe08a',
    initials: 'LO', bio: 'F1 + touring cars.', stats: { models: 19, finds: 8, trades: 14, rating: 4.6 } },
  { id: 'c5', name: 'Mara Vogt', handle: '@maramini', city: 'Vienna', color: '#ff7aa8',
    initials: 'MV', bio: 'Cabinet builder, 1:64.', stats: { models: 52, finds: 27, trades: 12, rating: 4.8 } },
  { id: 'c6', name: 'Dario Colombo', handle: '@dariodc', city: 'Milan', color: '#5fd0ff',
    initials: 'DC', bio: 'Exotics under glass.', stats: { models: 33, finds: 15, trades: 8, rating: 5.0 } },
  { id: 'c7', name: 'Yuki Tanaka', handle: '@yukigarage', city: 'Tokyo', color: '#ff6b81',
    initials: 'YT', bio: 'Carded 2000GT hunter.', stats: { models: 71, finds: 40, trades: 3, rating: 4.9 } },
  { id: 'c8', name: 'Ada Ferrer', handle: '@adafinds', city: 'Madrid', color: '#b3ff5c',
    initials: 'AF', bio: 'Flea market pro.', stats: { models: 22, finds: 48, trades: 6, rating: 4.7 } },
]

const brandColor = {
  'Hot Wheels': '#ff3d2e',
  'Mini GT': '#2e9fff',
  'BBR': '#ff9a3d',
  'AUTOart': '#a06bff',
  'Inno64': '#00c2a8',
  'Tarmac Works': '#2fbf5f',
  'Solido': '#ffd23d',
  'Ebbro': '#5fd0ff',
}
export const brandColorOf = (brand) => brandColor[brand] || '#9aa1ad'

const applyRefs = (models) =>
  models.map((m) => {
    const ref = { m1: 'a1', m2: 'a2' }[m.id]
    return ref ? { ...m, listed: true, auctionId: ref } : m
  })

export const myModels = [
  { id: 'm1', name: 'Porsche 911 GT3 RS', brand: 'Mini GT', scale: '1:64', year: 2022,
    condition: 'Fresh', color: 'Ultraviolet', value: 42, added: daysAgo(30), rarity: 'Rare',
    tags: ['Porsche', 'GT3', 'New casting'] },
  { id: 'm2', name: 'Ferrari F40', brand: 'BBR', scale: '1:18', year: 1987,
    condition: 'Display', color: 'Rosso Corsa', value: 320, added: daysAgo(64), rarity: 'Legendary',
    tags: ['Ferrari', '1:18', 'Legend'] },
  { id: 'm3', name: 'Toyota Supra MK4', brand: 'AUTOart', scale: '1:18', year: 1993,
    condition: 'Display', color: 'Reynolds Blue', value: 180, added: daysAgo(120), rarity: 'Epic',
    tags: ['JDM', '1:18'] },
  { id: 'm4', name: 'Honda NSX Type R', brand: 'Hot Wheels', scale: '1:64', year: 1997,
    condition: 'Carded', color: 'Championship White', value: 24, added: daysAgo(12), rarity: 'Common',
    tags: ['JDM', 'Carded'] },
  { id: 'm5', name: 'Mercedes 190E Evo II', brand: 'Inno64', scale: '1:64', year: 1990,
    condition: 'Carded', color: 'Blue-Black', value: 58, added: daysAgo(8), rarity: 'Rare',
    tags: ['DTM', 'Carded'] },
  { id: 'm6', name: 'Lancia Delta HF Integrale', brand: 'Tarmac Works', scale: '1:64', year: 1991,
    condition: 'Fresh', color: 'Martini', value: 36, added: daysAgo(5), rarity: 'Common',
    tags: ['Rally', 'Martini'] },
  { id: 'm7', name: 'BMW M3 E30', brand: 'Inno64', scale: '1:64', year: 1988,
    condition: 'Fresh', color: 'Macao Blue', value: 44, added: daysAgo(3), rarity: 'Rare',
    tags: ['DTM', 'Classic'] },
  { id: 'm8', name: 'Lamborghini Countach', brand: 'Hot Wheels', scale: '1:64', year: 1976,
    condition: 'Carded', color: 'Redline OG', value: 95, added: daysAgo(45), rarity: 'Epic',
    tags: ['Vintage', 'Redline'] },
  { id: 'm9', name: 'Peugeot 205 T16', brand: 'Tarmac Works', scale: '1:64', year: 1985,
    condition: 'Fresh', color: 'AXXE White', value: 40, added: daysAgo(2), rarity: 'Common',
    tags: ['Rally', '80s'] },
  { id: 'm10', name: 'Alpine A110', brand: 'Tarmac Works', scale: '1:18', year: 1972,
    condition: 'Display', color: 'Tour de France Blue', value: 150, added: daysAgo(80), rarity: 'Epic',
    tags: ['French', '1:18'] },
  { id: 'm11', name: 'Nissan Skyline 2000GT-R', brand: 'Ebbro', scale: '1:43', year: 1971,
    condition: 'Fresh', color: 'Sprint White', value: 70, added: daysAgo(15), rarity: 'Rare',
    tags: ['JDM', 'Vintage'] },
  { id: 'm12', name: 'Dodge Charger 500', brand: 'Hot Wheels', scale: '1:64', year: 1969,
    condition: 'Carded', color: 'Turquoise', value: 48, added: daysAgo(20), rarity: 'Common',
    tags: ['Muscle', 'Carded'] },
]

export const RARITY_ORDER = ['Common', 'Rare', 'Epic', 'Legendary']

const rarityBase = { Common: 60, Rare: 170, Epic: 280, Legendary: 400 }

export const rarityWeight = (rarity) => rarityBase[rarity] || rarityBase.Common

export const modelScore = (model) =>
  Math.round(rarityWeight(model.rarity) + (Number(model.value) || 0) * 1.5)

export const rarityRank = (rarity) => RARITY_ORDER.indexOf(rarity || 'Common')

export const seedAuctions = [
  {
    id: 'a1',
    model: { name: 'Porsche 911 GT3 RS', brand: 'Mini GT', scale: '1:64', color: 'Ultraviolet' },
    sellerId: 'me', opening: daysAgo(2), endsAt: hoursFromNow(40),
    startingBid: 30, buyNow: 75, status: 'active', winnerId: null,
    bids: [
      { userId: 'c1', amount: 35, at: hoursFromNow(-30) },
      { userId: 'c4', amount: 40, at: hoursFromNow(-22) },
      { userId: 'c7', amount: 44, at: hoursFromNow(-8) },
    ],
  },
  {
    id: 'a2',
    model: { name: 'Ferrari F40', brand: 'BBR', scale: '1:18', color: 'Rosso Corsa' },
    sellerId: 'me', opening: daysAgo(1), endsAt: hoursFromNow(5),
    startingBid: 250, buyNow: 0, status: 'active', winnerId: null,
    bids: [
      { userId: 'c6', amount: 260, at: hoursFromNow(-18) },
      { userId: 'c3', amount: 270, at: hoursFromNow(-6) },
      { userId: 'c6', amount: 285, at: hoursFromNow(-2) },
    ],
  },
  {
    id: 'a3',
    model: { name: 'Porsche 917K Gulf', brand: 'Mini GT', scale: '1:64', color: 'Gulf' },
    sellerId: 'c1', opening: daysAgo(4), endsAt: hoursFromNow(-6),
    startingBid: 40, buyNow: 0, status: 'ended', winnerId: 'c6',
    bids: [
      { userId: 'me', amount: 42, at: hoursFromNow(-30) },
      { userId: 'c4', amount: 46, at: hoursFromNow(-24) },
      { userId: 'c6', amount: 50, at: hoursFromNow(-12), },
      { userId: 'me', amount: 52, at: hoursFromNow(-10) },
      { userId: 'c6', amount: 58, at: hoursFromNow(-8) },
    ],
  },
  {
    id: 'a4',
    model: { name: 'Lancia 037 Rally', brand: 'Tarmac Works', scale: '1:43', color: 'Martini' },
    sellerId: 'c2', opening: daysAgo(2), endsAt: daysFromNow(3),
    startingBid: 38, buyNow: 90, status: 'active', winnerId: null,
    bids: [
      { userId: 'me', amount: 40, at: hoursFromNow(-20) },
      { userId: 'c5', amount: 45, at: hoursFromNow(-12) },
      { userId: 'me', amount: 52, at: hoursFromNow(-3) },
    ],
  },
  {
    id: 'a5',
    model: { name: 'Honda Civic Type R', brand: 'Inno64', scale: '1:64', color: 'Championship White' },
    sellerId: 'c3', opening: hoursFromNow(-12), endsAt: hoursFromNow(2),
    startingBid: 12, buyNow: 0, status: 'active', winnerId: null,
    bids: [
      { userId: 'c7', amount: 14, at: hoursFromNow(-9) },
      { userId: 'me', amount: 16, at: hoursFromNow(-5) },
      { userId: 'c8', amount: 18, at: hoursFromNow(-1) },
    ],
  },
]

export const seedFinds = [
  { id: 'f1', type: 'find', title: 'Full mainline case, untouched', brand: 'Hot Wheels',
    desc: 'Three STH candidates still on the peg. Go early, opens at 10am.', price: 190,
    shop: 'Wheels Corner Toys', city: 'Mumbai', hue: 12, expiresAt: hoursFromNow(21),
    loc: { x: 34, y: 38, label: 'Warschauer St. market' },
    geo: { lat: 52.5063, lng: 13.4515 }, by: 'me', at: hoursFromNow(-3) },
  { id: 'f2', type: 'find', title: 'Greenlight clearance bin', brand: 'Greenlight',
    desc: 'Half price on 2022 stock, mostly pickups and haulers.', price: 450,
    shop: 'Hobby Junction', city: 'Bengaluru', hue: 140, expiresAt: hoursFromNow(16),
    loc: { x: 63, y: 26, label: 'Pankow thrift' },
    geo: { lat: 52.5672, lng: 13.4109 }, by: 'c8', at: hoursFromNow(-8) },
  { id: 'f3', type: 'find', title: 'Mini GT restock', brand: 'Mini GT',
    desc: 'Fresh Mini GT and Tarmac Works pegs, no scalpers yet.', price: 1250,
    shop: 'Scale Model Bazaar', city: 'Delhi', hue: 210, expiresAt: hoursFromNow(10),
    loc: { x: 71, y: 58, label: 'Neukölln meet' },
    geo: { lat: 52.477, lng: 13.432 }, by: 'c1', at: hoursFromNow(-14) },
  { id: 'f4', type: 'find', title: 'Tomica premium drop', brand: 'Tomica',
    desc: 'Only four left when I walked out.', price: 890,
    shop: 'Kidz Planet', city: 'Kolkata', hue: 280, expiresAt: hoursFromNow(4),
    loc: { x: 24, y: 68, label: 'Tempelhof toy fair' },
    geo: { lat: 52.469, lng: 13.383 }, by: 'c5', at: hoursFromNow(-20) },
  { id: 'f5', type: 'trade', title: 'Gulf 917K ↔ 288 GTO swap', brand: 'Mini GT',
    desc: 'Boxed swap only, both mint. Meet in person.', price: 0,
    shop: 'Mauerpark stalls', city: 'Berlin', hue: 190, expiresAt: hoursFromNow(30),
    loc: { x: 49, y: 52, label: 'Mauerpark stalls' },
    geo: { lat: 52.5434, lng: 13.4048 }, by: 'c6', at: daysAgo(1) },
  { id: 'f6', type: 'trade', title: 'Saturday trade meetup — even swaps', brand: 'Any',
    desc: '100+ castings on the table. Bring openers.', price: 0,
    shop: 'Wedding club', city: 'Berlin', hue: 40, expiresAt: hoursFromNow(48),
    loc: { x: 83, y: 33, label: 'Wedding club' },
    geo: { lat: 52.547, lng: 13.362 }, by: 'c4', at: daysAgo(2) },
  { id: 'f7', type: 'trade', title: 'Vintage Redline swap night', brand: 'Hot Wheels',
    desc: 'Trading 60s–70s redlines. Photos on request.', price: 0,
    shop: 'Kreuzberg shop', city: 'Berlin', hue: 330, expiresAt: hoursFromNow(12),
    loc: { x: 47, y: 78, label: 'Kreuzberg shop' },
    geo: { lat: 52.4981, lng: 13.4032 }, by: 'me', at: hoursFromNow(-9) },
]

export const MAP_CENTER = { lat: 52.5265, lng: 13.401 }

const normalize = (value = '') => String(value).toLowerCase().trim().replace(/\s+/g, ' ')

const nameTokens = (value = '') =>
  normalize(value)
    .split(' ')
    .filter((t) => t.length >= 3)

/**
 * Find whether a wishlist item matches an existing auction lot or a find post.
 * - Auction match: same brand + same scale and the names overlap.
 * - Find match: brand matches (or the post is "Any") and a name token appears
 *   in the post title/brand. Finds are shelf posts, so this is a loose "shelf match".
 */
export function wishlistMatches(item, { finds = [], auctions = [] } = {}) {
  const want = normalize(item.name)
  const tokens = nameTokens(item.name)
  const wantBrand = normalize(item.brand)
  const wantScale = normalize(item.scale)
  const out = { auction: null, finds: [] }

  for (const auction of auctions) {
    const m = auction.model || {}
    const brandOk = !wantBrand || normalize(m.brand) === wantBrand
    const scaleOk = !wantScale || normalize(m.scale) === wantScale
    const an = normalize(m.name)
    const nameOk =
      !!want && Boolean(
        want === an ||
        (want.length >= 4 && (want.includes(an) || an.includes(want))) ||
        tokens.some((t) => an.includes(t))
      )
    if (brandOk && scaleOk && nameOk) {
      out.auction = auction
      break
    }
  }

  for (const find of finds) {
    const brandOk =
      !wantBrand ||
      normalize(find.brand) === wantBrand ||
      normalize(find.brand) === 'any'
    const haystack = `${normalize(find.title)} ${normalize(find.brand)}`
    const tokenHit = tokens.some((t) => haystack.includes(t)) || (want.length >= 4 && haystack.includes(want))
    if (brandOk && tokenHit) out.finds.push(find)
  }

  return out
}

export const seedWishlist = [
  { id: 'w1', name: 'Porsche 911 GT3 RS', brand: 'Mini GT', scale: '1:64', note: 'Watching the live lot — hoping it stays under €60.', addedAt: daysAgo(3) },
  { id: 'w2', name: 'Honda Civic Type R', brand: 'Inno64', scale: '1:64', note: 'Backup target if the auction ends cheap.', addedAt: daysAgo(2) },
  { id: 'w3', name: 'Hot Wheels STH', brand: 'Hot Wheels', scale: '1:64', note: 'Any fresh mainline case worth a look.', addedAt: hoursFromNow(-9) },
]

export const seedActivity = [
  { id: 'x1', type: 'bid', userId: 'c7', amount: 66, target: 'Apex Hyper R', ts: minutesAgo(6) },
  { id: 'x2', type: 'bid', userId: 'c4', amount: 15, target: 'Ranch Hauler', ts: minutesAgo(22) },
  { id: 'x3', type: 'bid', userId: 'c8', amount: 41, target: 'Rally 13 Legend', ts: minutesAgo(48) },
  { id: 'x4', type: 'flex', userId: 'me', model: 'Porsche 911 GT3 RS', brand: 'Mini GT', year: 2022,
    scale: '1:64', rarity: 'Rare', value: 42, score: 233, ts: minutesAgo(95) },
  { id: 'x5', type: 'listing', userId: 'c1', target: 'Ferrari F40', starting: 250, ts: minutesAgo(160) },
  { id: 'x6', type: 'flex', userId: 'me', model: 'Toyota Supra MK4', brand: 'AUTOart', year: 1993,
    scale: '1:18', rarity: 'Epic', value: 180, score: 550, ts: minutesAgo(200) },
  { id: 'x7', type: 'grab', userId: 'c5', target: 'Wheels Corner Toys', city: 'Mumbai', ts: minutesAgo(320) },
  { id: 'x8', type: 'comment', userId: 'c3', target: 'Porsche 911 GT3 RS', ts: minutesAgo(420) },
  { id: 'x9', type: 'listing', userId: 'c2', target: 'Alpine A110', starting: 90, ts: minutesAgo(540) },
  { id: 'x10', type: 'flex', userId: 'c6', model: 'Lamborghini Countach', brand: 'Hot Wheels', year: 1976,
    scale: '1:64', rarity: 'Epic', value: 95, score: 422, ts: minutesAgo(660) },
]

export const seedPosts = [
  { id: 'p1', authorId: 'c3', community: 'Racing Legends (1:64)',
    content: 'Pulled a full case of the new “Racing City” set today. Two Supra chase cards and a clean 964. Message me for pick swaps (demo).',
    ts: minutesAgo(18), likes: 34, liked: false, comments: 6, auctionId: 'a5' },
  { id: 'p2', authorId: 'me', community: 'Berlin Trade Circle',
    content: 'Third row of the garage shelf is done — E30, 190E and the Delta finally boxed properly.',
    ts: minutesAgo(75), likes: 12, liked: true, comments: 2, auctionId: null },
  { id: 'p3', authorId: 'c1', community: 'Berlin Trade Circle',
    content: 'Trade delivered — Gulf 917K is on the road to @dariodc, 288 GTO landed in Rotterdam.',
    ts: minutesAgo(160), likes: 27, liked: false, comments: 8, auctionId: null },
  { id: 'p4', authorId: 'c4', community: '1:18 Diecast Garage',
    content: 'WTB: 1:18 Testarossa, any color, EU only. Offers welcome in DMs (demo).',
    ts: minutesAgo(320), likes: 9, liked: false, comments: 11, auctionId: null },
  { id: 'p5', authorId: 'c5', community: '1:18 Diecast Garage',
    content: 'Custom acrylic shelving for 1:64 — 6 rows, LED backlight, zero dust. Happy to explain the build.',
    ts: minutesAgo(540), likes: 41, liked: false, comments: 15, auctionId: null },
  { id: 'p6', authorId: 'c6', community: 'Hot Wheels Alps Crew',
    content: 'My F40 goes under the hammer in a few hours. Final call before it switches to fixed sale (demo auction).',
    ts: minutesAgo(660), likes: 22, liked: false, comments: 5, auctionId: 'a2' },
  { id: 'p7', authorId: 'c7', community: 'Hot Wheels Alps Crew',
    content: 'Carded 2000GT straight out of Tokyo. Never opened, buyer picks it up locally.',
    ts: minutesAgo(1440), likes: 18, liked: false, comments: 3, auctionId: null },
  { id: 'p8', authorId: 'me', community: 'Racing Legends (1:64)',
    content: 'Listed my GT3 RS for 40 hours — start €30. Live bids on the BIDS tab (demo).',
    ts: minutesAgo(1560), likes: 20, liked: false, comments: 7, auctionId: 'a1' },
]

export const seedCommunities = [
  { id: 'g1', name: 'Racing Legends (1:64)', members: 1501, tag: '64th scale race cars', joined: false },
  { id: 'g2', name: '1:18 Diecast Garage', members: 943, tag: 'Big scale, big shelf', joined: true },
  { id: 'g3', name: 'Berlin Trade Circle', members: 214, tag: 'Local swaps & meets', joined: true },
  { id: 'g4', name: 'Hot Wheels Alps Crew', members: 182, tag: 'Alpine hunters', joined: false },
]

export const seedConversations = [
  { id: 'm1', with: 'c3', last: 'The F40 card looks great — picking up after 18:00?', ts: minutesAgo(40) },
  { id: 'm2', with: 'c6', last: 'Bid placed on your auction (demo).', ts: minutesAgo(120) },
  { id: 'm3', with: 'c4', last: 'Saturday, bring the Charger.', ts: minutesAgo(1440) },
]

export function buildSeed() {
  return {
    version: 3,
    models: applyRefs(myModels),
    auctions: seedAuctions,
    finds: seedFinds.map((find) => ({ status: 'active', confirmedAt: find.at, ...find })),
    posts: seedPosts,
    activity: seedActivity,
    communities: seedCommunities,
    conversations: seedConversations,
    wishlist: seedWishlist,
    messagesOpened: 0,
  }
}