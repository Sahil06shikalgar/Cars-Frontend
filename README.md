# Diecet Gardage — Frontend

React 19 + Vite app for the diecast collector: vault, wishlist, finds map, auctions, feed, messages.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Live mode (with the backend)

The app runs fully in **demo mode** on first load using browser-local sample data (localStorage key `diecast_vault_v1`).

To use the real API:

1. Start the backend first — see `../Backend/README.md` (needs MongoDB Atlas + `.env`).
2. Let the dev server run on http://localhost:5050 (Vite already proxies `/api`, `/uploads`, `/socket.io`).
3. In the app, click **Sign in** (top banner) and log in, or create an account.
4. The banner turns green ("Syncing with your account") — vault, finds, auctions, feed and messages now come from MongoDB and every mutation (add model, bid, post, message, find status) is confirmed by the server.
5. Sign out returns to demo mode with the browser-local data.

Packaged for hosting by `npm run build` + `npm run preview` (port 4173).

## What's covered

- **Vault**: collection + wishlist, search/filter by scale, list models for auction, live wishlist-match badges
- **Finds**: Leaflet map with CARTO dark tiles, geolocation tracking, status updates (still there / sold out / grabbed)
- **Auctions**: live + ended tabs, 3D car viewer, atomic server-side bids, buy now, seller close
- **Feed**: posts, likes, comments, communities
- **Messages**: conversations with real message history + Socket.IO live updates when signed in
- **Account**: login / signup / password reset against the backend, session cookie (never stores passwords in localStorage)

## Checks

```bash
npm run lint      # oxlint
npm run build     # production build
```