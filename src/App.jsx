import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { StoreProvider, useStore } from './store/useStore.jsx'
import { AppLayout } from './components/AppLayout.jsx'
import { Splash } from './components/Splash.jsx'
import { PageSkeleton } from './components/Skeleton.jsx'
import { CarIcon } from './components/icons.jsx'

const VaultPage = lazy(() => import('./pages/VaultPage.jsx').then((m) => ({ default: m.VaultPage })))
const CarDetailPage = lazy(() => import('./pages/CarDetailPage.jsx').then((m) => ({ default: m.CarDetailPage })))
const FindsPage = lazy(() => import('./pages/FindsPage.jsx'))
const FeedPage = lazy(() => import('./pages/FeedPage.jsx').then((m) => ({ default: m.FeedPage })))
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx').then((m) => ({ default: m.MessagesPage })))
const AuctionsPage = lazy(() => import('./pages/AuctionsPage.jsx').then((m) => ({ default: m.AuctionsPage })))
const AuctionDetailPage = lazy(() => import('./pages/AuctionDetailPage.jsx').then((m) => ({ default: m.AuctionDetailPage })))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))

function RouteFallback() {
  const { pathname } = useLocation()
  return <PageSkeleton path={pathname} />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelector('.app__main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// Full-screen loader shown until the server session is resolved. Nothing
// private is rendered before we know who (if anyone) is signed in.
function AuthLoading() {
  return (
    <div className="splash" role="status" aria-label="Checking your session">
      <div className="splash__logo"><CarIcon size={44} /></div>
      <div className="splash__name">Diecet<span> Gardage</span></div>
      <div className="splash__bar"><span className="splash__bar-fill" aria-hidden="true" /></div>
    </div>
  )
}

function SessionGate({ children }) {
  const { ready, session } = useStore()
  if (!ready || session.mode === 'loading') return <AuthLoading />
  return children
}

// Any private page renders only for an authenticated user; otherwise the
// browser is redirected to /login and sent back after signing in.
function RequireAuth({ children }) {
  const { session } = useStore()
  const location = useLocation()
  if (session.mode === 'loading') return <AuthLoading />
  if (session.mode !== 'live' || !session.user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<RequireAuth><Suspense fallback={<RouteFallback />}><VaultPage /></Suspense></RequireAuth>} />
        <Route path="/wishlist" element={<RequireAuth><Suspense fallback={<RouteFallback />}><VaultPage initialTab="wishlist" /></Suspense></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Suspense fallback={<RouteFallback />}><VaultPage initialTab="me" /></Suspense></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Suspense fallback={<RouteFallback />}><VaultPage initialTab="me" /></Suspense></RequireAuth>} />
        <Route path="/car/:id" element={<RequireAuth><Suspense fallback={<RouteFallback />}><CarDetailPage /></Suspense></RequireAuth>} />
        <Route path="/finds" element={<Suspense fallback={<RouteFallback />}><FindsPage /></Suspense>} />
        <Route path="/feed" element={<Suspense fallback={<RouteFallback />}><FeedPage /></Suspense>} />
        <Route path="/messages" element={<RequireAuth><Suspense fallback={<RouteFallback />}><MessagesPage /></Suspense></RequireAuth>} />
        <Route path="/auctions" element={<Suspense fallback={<RouteFallback />}><AuctionsPage /></Suspense>} />
        <Route path="/auctions/:id" element={<Suspense fallback={<RouteFallback />}><AuctionDetailPage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<RouteFallback />}><AuthPage pageKey="login" /></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={<RouteFallback />}><AuthPage pageKey="signup" /></Suspense>} />
        <Route path="/forgot" element={<Suspense fallback={<RouteFallback />}><AuthPage pageKey="forgot" /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Splash />
        <SessionGate>
          <AppRoutes />
        </SessionGate>
      </BrowserRouter>
    </StoreProvider>
  )
}

export default App