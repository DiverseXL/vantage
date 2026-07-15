import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './lib/wagmi';
import { UserProvider } from './contexts/UserContext';
import { AdminProvider } from './contexts/AdminContext';
import { AudioProvider } from './contexts/AudioContext';
import { AnimatedRoutes } from './components/app/AnimatedRoutes';
import { CommandMenu } from './components/app/CommandMenu';
import { RouteLoader } from './components/app/RouteLoader';
import { IntroSplash } from './components/landing/IntroSplash';

import AOS from 'aos';
import 'aos/dist/aos.css';
import { MotionConfig } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 2000,
    },
  },
});

export function App() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      mirror: false,
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <AdminProvider>
            {/* AudioProvider wraps the entire tree so any component can
                use useAudio() without prop drilling */}
            <AudioProvider>
              <MotionConfig reducedMotion="user">
                <BrowserRouter>
                  <IntroSplash />
                  <RouteLoader />
                  <AnimatedRoutes />
                  <CommandMenu />
                </BrowserRouter>

                {/* Global toast renderer */}
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 5000,
                    style: {
                      background: '#17171A',
                      color: '#FFFFFF',
                      fontFamily: "'Supreme', system-ui, sans-serif",
                      fontSize: '14px',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      maxWidth: '420px',
                    },
                    success: {
                      iconTheme: { primary: '#22C55E', secondary: '#17171A' },
                    },
                    error: {
                      iconTheme: { primary: '#EF4444', secondary: '#17171A' },
                    },
                    loading: {
                      iconTheme: { primary: '#8C8C90', secondary: '#17171A' },
                    },
                  }}
                />
              </MotionConfig>
            </AudioProvider>
          </AdminProvider>
        </UserProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
