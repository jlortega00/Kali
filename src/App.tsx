import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import HomePage from './pages/HomePage'
import OnboardingPage, { hasCompletedOnboarding } from './pages/OnboardingPage'

const DesignPage = lazy(() => import('./pages/DesignPage'))
const FriendsPage = lazy(() => import('./pages/FriendsPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const CatchFoodGame = lazy(() => import('./pages/minigames/CatchFoodGame'))
const MemoryPairsGame = lazy(() => import('./pages/minigames/MemoryPairsGame'))
const MinigamesPage = lazy(() => import('./pages/MinigamesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))

function RootRedirect() {
  return <Navigate to={hasCompletedOnboarding() ? '/home' : '/onboarding'} replace />
}

function RouteFallback() {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-soft">Cargando…</div>
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/design" element={<DesignPage />} />
        <Route path="/legal/:type" element={<LegalPage />} />

        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/minigames" element={<MinigamesPage />} />
          <Route path="/minigames/catch-food" element={<CatchFoodGame />} />
          <Route path="/minigames/memory-pairs" element={<MemoryPairsGame />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
