import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Landing } from '../../pages/Landing';
import { MarketsExplorer } from '../../pages/MarketsExplorer';
import { MarketDetail } from '../../pages/MarketDetail';
import { UserDashboard } from '../../pages/UserDashboard';
import { AdminDashboard } from '../../pages/AdminDashboard';
import { AppLayout } from '../../layouts/AppLayout';
import { PageTransition } from './PageTransition';

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Marketing landing page (no AppLayout) */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />

        {/* App shell — all routes share AppNav */}
        <Route element={<AppLayout />}>
          <Route path="/markets" element={<PageTransition><MarketsExplorer /></PageTransition>} />
          <Route path="/market/:id" element={<PageTransition><MarketDetail /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><UserDashboard /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
