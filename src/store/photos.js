// Photo library for the demo. Photos are served from the backend's uploads
// folder (/uploads/Cars, /uploads/Finds — proxied to localhost:5050 by Vite),
// assigned deterministically to each card so every model/find shows a distinct
// photo. If the backend is down the <img> onError handler swaps to the
// illustrated tile rendered by ModelThumb / FindCard.
const UPLOADS = {
  cars: [
    '/uploads/Cars/car-1-Xdlto-Sa.jpg',
    '/uploads/Cars/car-2-DsJECiLL.jpg',
    '/uploads/Cars/car-3-Bhmbv--t.jpg',
    '/uploads/Cars/car-4-CkqnyCeK.jpg',
    '/uploads/Cars/car-5-BTL-bhuC.jpg',
    '/uploads/Cars/car-6-DyQsVnjh.jpg',
  ],
  finds: [
    '/uploads/Finds/find-1-CiWavn-S.jpg',
    '/uploads/Finds/find-2-dS6oQXzx.jpg',
    '/uploads/Finds/find-3-BultK7tA.jpg',
    '/uploads/Finds/find-4-Bz7o4v3S.jpg',
  ],
}

// Stable name hash -> keeps each card on the same photo across reloads.
function hashIndex(key, len) {
  let h = 0
  const s = String(key)
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % len
}

// When the app talks to a backend on another origin (VITE_API_URL), photo paths
// must be absolute — otherwise <img src="/uploads/..."> resolves against the
// page origin instead of the API server.
const apiBase = () => (globalThis.__API_BASE__ || '').replace(/\/$/, '')

export function photoOf(name = '', brand = '') {
  return apiBase() + UPLOADS.cars[hashIndex(`${name}::${brand}`, UPLOADS.cars.length)]
}

export function photoOfFind(find) {
  return apiBase() + UPLOADS.finds[hashIndex(`${find.id || find.title}::${find.brand}`, UPLOADS.finds.length)]
}