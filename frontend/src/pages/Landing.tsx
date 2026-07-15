import { createPortal } from 'react-dom';
import { AppNav } from '../components/app/AppNav';
import { ScrollProgressProvider } from '../hooks/useScrollProgress';
import { OracleRef } from '../components/landing/OracleRef';
import { ScrollBall } from '../components/landing/ScrollBall';
import { Hero } from '../components/landing/Hero';
import { StatsStrip } from '../components/landing/StatsStrip';
import { ValueProp } from '../components/landing/ValueProp';
import { MarketCategories } from '../components/landing/MarketCategories';
import { WhyVantage } from '../components/landing/WhyVantage';
import { HowItWorks } from '../components/landing/HowItWorks';
import { MarketsPreview } from '../components/landing/MarketsPreview';
import { GradientCtaCard } from '../components/landing/GradientCtaCard';
import { PremiumTeaser } from '../components/landing/PremiumTeaser';
import { TransparencyCallout } from '../components/landing/TransparencyCallout';
import { FAQ } from '../components/landing/FAQ';
import { AppFooter } from '../components/app/AppFooter';
import styles from './Landing.module.css';

export function Landing() {
  return (
    <ScrollProgressProvider>
      <div className={`landing-container ${styles.page}`}>
        {createPortal(
          <>
            <OracleRef />
            <ScrollBall />
          </>,
          document.body
        )}

        {/* Floating nav — transparent, fixed-position internally */}
      <div className={styles.navWrapper}>
        <AppNav />
      </div>

      <main id="main-content">

        {/* ════════════════════════════════════════════════
            ZONE 1 — Dark green
            ════════════════════════════════════════════════ */}
        <Hero />
        <StatsStrip />

        {/* ════════════════════════════════════════════════
            ZONE 2 — Black
            Screenshot ref 1: big headline + 3-col features
            ════════════════════════════════════════════════ */}
        <ValueProp />

        {/* ════════════════════════════════════════════════
            ZONE 3 — White
            ════════════════════════════════════════════════ */}
        <MarketCategories />
        <WhyVantage />
        <HowItWorks />

        {/* ════════════════════════════════════════════════
            ZONE 4 — Black (Featured markets showcase)
            ════════════════════════════════════════════════ */}
        <MarketsPreview />

        {/* ════════════════════════════════════════════════
            ZONE 5 — White
            Screenshot ref 4: gradient CTA card
            ════════════════════════════════════════════════ */}
        <GradientCtaCard />

        {/* ════════════════════════════════════════════════
            ZONE 6 — White
            ════════════════════════════════════════════════ */}
        <PremiumTeaser />

        {/* ════════════════════════════════════════════════
            ZONE 7 — Light grey — plain honesty section
            ════════════════════════════════════════════════ */}
        <TransparencyCallout />

        {/* ════════════════════════════════════════════════
            ZONE 8 — White
            Screenshot ref 3: two-column FAQ
            ════════════════════════════════════════════════ */}
        <FAQ />

      </main>

      <AppFooter />
      </div>
    </ScrollProgressProvider>
  );
}
