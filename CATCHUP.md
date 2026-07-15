# Vantage Project Catch-Up Report

Generated: July 15, 2026
Baseline: contract deployed at 0x7978b758432C6F71f386064ef8E271054d943378 on Injective EVM Testnet, backend with markets/bets/premium routes, ledger.ts, archival RPC fix, forked cctp-mcp/ with Injective testnet. No frontend, no TxODDS integration.

---

## 1. Frontend

### Stack

- **Framework**: React 19 with TypeScript (strict mode)
- **Bundler**: Vite 8.x (dev server on port 5173)
- **Routing**: react-router-dom v7 (client-side routing with AnimatePresence transitions)
- **State management**: @tanstack/react-query v5 (server state), React Contexts (auth/audio/admin preferences)
- **Wallet connection**: wagmi v3 + viem v2 (EIP-1193 connector, MetaMask/injected)
- **Authentication**: SIWE (Sign-In with Ethereum) via the `siwe` library, JWT tokens from backend
- **UI animations**: framer-motion v12 (page transitions, micro-interactions), GSAP v3 (scroll-triggered landing choreography), AOS (scroll-reveal on landing sections)
- **Audio feedback**: cuelume v0.1.1 (browser-safe interaction sounds on user gesture)
- **HTTP client**: axios v1 (with interceptors for admin key injection, JWT injection, error normalization)
- **Notifications**: react-hot-toast
- **Icons**: lucide-react
- **Typography**: Fontshare fonts (Synonym body, Chillax display, Array accent/glitch)

### Folder Structure

```
frontend/
  index.html                          -- Entry HTML with font preconnects
  package.json                        -- Dependencies (see stack above)
  tsconfig.json                       -- TypeScript config (bundler mode, noUnusedLocals)
  vite.config.ts                      -- Vite config with /api proxy to localhost:3001
  src/
    main.tsx                          -- React root mount, audio init
    main.ts                           -- Vanilla Vite scaffolding (UNUSED/leftover from create)
    counter.ts                        -- Vanilla Vite example (UNUSED/leftover)
    style.css                         -- Vanilla Vite example styles (UNUSED/leftover)
    App.tsx                           -- Root component: WagmiProvider > QueryClient > User > Admin > Audio > BrowserRouter
    types/api.ts                      -- All API response types (Market, Bet, Claim, balances, etc.)
    styles/
      tokens.css                      -- Design tokens (colors, spacing, typography, radius, shadows)
      global.css                      -- Global reset, scrollbar, focus, button base styles
    lib/
      api.ts                          -- Axios instance with interceptors, base URL from VITE_API_BASE_URL
      contracts.ts                    -- Contract ABI + address for direct wallet interactions (placeBet, claimPayout)
      format.ts                       -- Formatting helpers (wei->INJ, timestamps, pool splits, explorer URLs)
      wagmi.ts                        -- Wagmi config: injected connector, Injective EVM Testnet chain (ID 1439)
      motion.ts                       -- Framer-motion shared config (ease curves, durations, springs)
      audio.ts                        -- Global audio init, cuelume bind, safePlay wrapper, localStorage preference
      useAudio.ts                     -- React hook mapping semantic actions to audio cues
    contexts/
      UserContext.tsx                  -- SIWE auth: connects wallet, fetches nonce, signs, stores JWT in localStorage
      AdminContext.tsx                 -- Admin key entry/clear, persisted to localStorage:vantage:adminKey
      AudioContext.tsx                 -- Sound preference toggle, consumed by useAudio hook
    hooks/
      useMarkets.ts                   -- TanStack Query hook: GET /api/markets, GET /api/markets/:id, 10s poll
      useUserBalance.ts               -- TanStack Query hook: GET /api/users/:userId/balance, 10s poll
      useFixtures.ts                  -- TanStack Query hook: GET /api/fixtures, GET /api/fixtures/:id/scores, 60s/15s poll
      useNavigationState.ts           -- Client-side navigation progress tracker
      useScrollProgress.tsx           -- GSAP ScrollTrigger progress context (landing page)
      useAsyncAction.ts               -- State machine for async button actions (idle/pending/success/error)
    services/
      MarketService.ts                -- API calls: getMarkets, getMarket, createMarket, resolveMarket, finalizeResolution
      BetService.ts                   -- API calls: indexBet (POST /api/markets/:id/bet), indexClaim
      UserService.ts                  -- API calls: getUserBalance
      PremiumService.ts               -- API calls: getInsight, getPaymentInstructions (402 flow)
    pages/
      Landing.tsx                     -- Full marketing landing with 8 zones (Hero, Stats, ValueProp, Categories, Why, HowItWorks, MarketsPreview, CTA, Premium, Transparency, FAQ)
      MarketsExplorer.tsx             -- Filterable/sortable grid of MarketCards, URL query param filters for stage/category
      MarketDetail.tsx                -- Single market view: betting form, pool breakdown, activity feed, paywalled AI insight
      UserDashboard.tsx               -- User stats (INJ staked, claimed, P/L, win rate), history table with tabs
      AdminDashboard.tsx              -- Admin key entry, create market form, resolve market form with confirmation dialog, finalize, all-markets table
    layouts/
      AppLayout.tsx                   -- Shared layout for authenticated routes (AppNav + Outlet + AppFooter)
    components/app/
      AppNav.tsx                      -- Top nav: wordmark, links, Info dropdown (with sounds toggle), wallet chip
      AppFooter.tsx                   -- Footer with branding, links, chain status badge
      MarketCard.tsx                  -- Market preview card with pool meter, animated pool counter, stage badge
      BettingForm.tsx                 -- Outcome selector radio group, amount input, place bet via wagmi writeContract
      ClaimButton.tsx                 -- Claim payout button (conditionally rendered for winning users)
      ActionButton.tsx                -- Reusable async button with spinner, success checkmark, error shake
      PaywallModal.tsx                -- L402 paywall: free 402 > payment instructions > tx hash input > unlock
      CommandMenu.tsx                 -- Cmd+K search modal, filters markets by description
      TicketElements.tsx              -- Reusable visual elements: PixelBolt, SegmentedMeter, PctReadout, ScoreboardRow
      Skeletons.tsx                   -- Loading skeletons (MarketCard, MarketDetail, Stats, ActivityFeed, AIInsight)
      EmptyState.tsx                  -- Generic empty state with optional CTA link
      ActivityFeed.tsx                -- Mock real-time activity feed with simulated updates
      ExplorerSidebar.tsx             -- Platform stats, how-to card, "whats happening now", activity feed
      OnboardingTip.tsx               -- Dismissible tip banner with localStorage persistence
      WalletConnectionLoader.tsx      -- Wallet connection state display (opening/awaiting/connected)
      RouteLoader.tsx                 -- Segmented route transition loader bar
      PageTransition.tsx              -- Framer motion page transition wrapper
      AnimatedRoutes.tsx              -- Route definitions: / (landing), /markets, /market/:id, /dashboard, /admin
      PixelSpinner.tsx                -- 8-block orbitting spinner
      LoaderElements.module.css       -- CSS for RouteLoader, PixelSpinner, splash screen
    components/landing/
      Hero.tsx                        -- Green zone hero with checkerboard bg, annotation marks, CTA
      StatsStrip.tsx                  -- Live stats (matches, INJ in play, open markets) with CountUp
      ValueProp.tsx                   -- Three-column feature showcase (transparent, instant, non-custodial)
      MarketCategories.tsx            -- Four category cards (Group Stage, Knockout, Winner, Top Scorer)
      WhyVantage.tsx                  -- Comparison: Traditional Sportsbooks vs Vantage
      HowItWorks.tsx                  -- Three-step bento grid
      MarketsPreview.tsx              -- Live market cards OR TxOdds fixture cards (with flag images)
      GradientCtaCard.tsx             -- Gradient CTA card with pixel coin pattern
      PremiumTeaser.tsx               -- "Buy the read" premium section
      TransparencyCallout.tsx         -- Testnet notice with TxLINE oracle mention
      FAQ.tsx                         -- Accordion FAQ
      AnnotationMark.tsx              -- Hand-drawn SVG circle/underline annotation with draw-on-enter animation
      CountUp.tsx                     -- Animated counter using framer-motion useMotionValue
      IntroSplash.tsx                 -- Branded splash screen ("VANTAGE" letter animation, tagline, metrics)
      OracleRef.tsx                   -- GSAP-driven floating oracle character that walks/celebrates on scroll
      ScrollBall.tsx                  -- Fixed-position pixel ball that follows scroll progress
      GhostSVG.tsx                    -- FILE DOES NOT EXIST (imported but missing)
    styles/
      (CSS Module files per component)

### API Routes Called by Frontend

| Route | Method | Service | Notes |
|---|---|---|---|
| /api/markets | GET | MarketService | List all markets |
| /api/markets/:id | GET | MarketService | Single market |
| /api/markets | POST | MarketService | Create (admin) |
| /api/markets/:id/resolve | POST | MarketService | Propose resolution (admin) |
| /api/markets/:id/finalize | POST | MarketService | Finalize resolution (anyone) |
| /api/markets/:id/bet | POST | BetService | Index a bet after tx sent |
| /api/markets/:id/claim | POST | BetService | Index a claim after tx sent |
| /api/users/:userId/balance | GET | UserService | User dashboard/stats |
| /api/auth/nonce | GET | UserContext | SIWE nonce |
| /api/auth/verify | POST | UserContext | SIWE signature verification |
| /api/premium-stats/:marketId | GET | PremiumService | Paywalled AI insight |
| /api/fixtures | GET | useFixtures | TxOdds fixture list |
| /api/fixtures/:id/scores | GET | useFixtures | Live scores |
| /api/tx/:hash/status | GET | (via explorer links) | Transaction status check |

### Base URL Configuration

The frontend uses Vite's dev server proxy (/api -> http://localhost:3001) in development. The axios `api` instance reads `VITE_API_BASE_URL` from `import.meta.env` with a fallback of `http://localhost:3001`. The fixture hooks read `VITE_API_URL` with fallback `http://localhost:3001/api`.

### Wallet Connector

The frontend uses **wagmi v3** with the `injected()` connector (MetaMask, Rabby, Frame). Users do NOT need a custom Injective wallet -- any EVM wallet configured for Injective EVM Testnet (chain ID 1439) works. The SIWE auth flow signs a message to obtain a JWT. Bets and claims use the user's wallet directly via `useWriteContract` (not the relayer), but the backend is notified via the `/bet` and `/claim` endpoints to index the transaction.

### Backend Modifications to Support the Frontend

The following backend files were added or modified to support the frontend (none existed at baseline):

- **`backend/src/routes/auth.ts`** (NEW) -- SIWE nonce/verify endpoints, JWT middleware for protected routes
- **`backend/src/routes/fixtures.ts`** (NEW) -- TxOdds fixture and scores proxy endpoints
- **`backend/src/server.ts`** (MODIFIED) -- Added fixturesRouter, authRouter, rate limiting, /api/tx/:hash/status endpoint

---

## 2. TxODDS Integration

### Location

All TxODDS integration lives in three areas:

1. **`backend/src/routes/fixtures.ts`** -- Public proxy endpoints for fixture data
2. **`backend/src/oracle/txline.ts`** -- Solana devnet subscription, API activation, data fetching, and **automated market settlement loop**
3. **`backend/src/oracle/marketCreationLoop.ts`** -- Automated market creation for new World Cup fixtures
4. **`backend/src/oracle/txoracle.json`** -- Anchor IDL for the TxODDS Solana devnet program (program ID: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`)
5. **`backend/src/oracle/download.cjs`** -- Small script to download the IDL from GitHub
6. **`backend/src/oracle/devnet-wallet.json`** -- Solana devnet wallet keypair (auto-generated)
7. **`frontend/src/hooks/useFixtures.ts`** -- Frontend hooks to fetch fixtures and scores

### API / SDK / Package

TxODDS provides:
- A **Solana Anchor program** (txoracle) for data subscriptions and on-chain data verification
- A **REST API** at `https://txline-dev.txodds.com` for fixture data, odds snapshots, and API token activation
- The fixture proxy at `backend/src/routes/fixtures.ts` uses a **Blitz public proxy** (`https://blitz-pied.vercel.app/api/proxy`) that mirrors TxODDS fixtures without requiring API keys

**Credentials required**:
- `backend/src/oracle/txline.ts` uses a **Solana devnet wallet** (auto-generated in `devnet-wallet.json`) to pay subscription fees in TXL tokens
- The `subscribeAndActivate()` function obtains a JWT and an API token via the Solana program subscription flow
- **No user-facing API key or env-var credential is currently needed** for the proxy route (fixtures.ts), but the direct TxODDS API paths in txline.ts require the JWT and apiToken obtained at runtime
- The fixture proxy route has a comment noting that once a TxODDS subscription is activated, the PROXY_BASE URLs should be swapped for direct TxODDS endpoints with the API token

### What It Does

**Data fetched from TxODDS**:
- **Fixtures list** (`GET /api/fixtures`): Returns an array of `{ FixtureId, Participant1, Participant2, Competition, CompetitionId, StartTime, GameState, Ts, FixtureGroupId, Participant1Id, Participant2Id, Participant1IsHome? }`
- **Live scores** (`GET /api/fixtures/:id/scores`): Returns `{ FixtureId, Participant1Score?, Participant2Score?, Stats?, Events? }` where Events contain `{ Minute, Type, Team, Player? }`

**Usage in the frontend** (`MarketsPreview.tsx`):
- Displays live/upcoming fixtures with country flags (via `flagcdn.com`) when no open markets exist
- Shows match stage (Competition), live indicator, and team names

**Usage in the backend oracle** (`txline.ts`, `marketCreationLoop.ts`):
- **Market Creation Loop** (`marketCreationLoop.ts`): Runs every 30 seconds. Fetches fixtures, filters for World Cup (CompetitionId=72) non-finished matches, and creates a new on-chain market for any fixture that doesn't already have one. Links fixture IDs to market labels in the ledger.
- **Settlement Loop** (`txline.ts`, `runSettlementLoop()`): Runs every 30 seconds. Iterates all markets, checks if their linked fixture has `GameState === 4` (finished), and automatically calls `proposeResolution()` on the VantageMarket contract with the winning outcome determined by comparing `Participant1Score` and `Participant2Score`.

### Automated Resolution Risk -- CRITICAL FLAG

**The `runSettlementLoop()` in `backend/src/oracle/txline.ts` automatically calls `proposeResolution()` on-chain without human confirmation.** This is significant because:

1. The loop runs every 30 seconds and autonomously proposes resolutions for any finished fixture
2. It determines the winning outcome algorithmically: `Participant1Score > Participant2Score ? 0 : 1`
3. The VantageMarket contract's `proposeResolution` is owner-only (relayer wallet), and the oracle runs with the relayer's credentials
4. While `proposeResolution` starts a 24-hour challenge window (not immediately final), the contract is currently designed so that only the **owner** can propose -- meaning there is no multi-party dispute mechanism active yet (any address can finalize after 24h)

**Mitigating factors**:
- The settlement loop is NOT running by default -- it requires explicit invocation (`npx tsx src/oracle/txline.ts`). It's not part of the server startup.
- The code has explicit safety checks: it skips fixtures where score fields are missing, and it skips already-resolved/proposed markets
- The comment in the code acknowledges the risk: "Fabricating an outcome here would directly contradict the site's own transparency copy"

**Recommendation**: Do NOT run `runSettlementLoop()` in production without human-in-the-loop confirmation. The market creation loop (`marketCreationLoop.ts`) is lower risk since it only creates new markets, but should also be reviewed before production use.

### New Dependencies Installed for TxODDS

From `backend/package.json`:

| Package | Version | Purpose |
|---|---|---|
| @coral-xyz/anchor | ^0.32.1 | Solana Anchor framework for TxODDS program interaction |
| @solana/spl-token | ^0.4.15 | Solana SPL Token (for TXL token operations) |
| @solana/web3.js | ^1.98.4 | Solana RPC connection |
| tweetnacl | ^1.0.3 | Cryptographic signing for TxODDS API activation |
| axios | ^1.18.1 | HTTP client for TxODDS API calls |

---

## 3. Backend Changes (Diff Summary)

### `backend/src/contract.ts` (UNCHANGED from baseline)

- Still uses the archival RPC endpoint (`https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/`)
- Still uses `RELAYER_PRIVATE_KEY` from env
- The ABI is the same 7-field Market struct (as deployed)
- The **only notable diff**: the CONTRACT_ADDRESS changed from `0x7978b758432C6F71f386064ef8E271054d943378` (the one mentioned in HANDOFF.md and the baseline) to `0xD6F18e914D5e81ec7fc01DEC728FF7Aa7C5979b9` (the current deployed address). The ignition deployment at `chain-1439/deployed_addresses.json` also reflects `0xD6F18e914D5e81ec7fc01DEC728FF7Aa7C5979b9`.

### `backend/src/ledger.ts` (MODIFIED)

- Added `MarketLabels` interface with `outcome0Label`, `outcome1Label`, `category`, `stage`, and `fixtureId` fields
- Added `markets` key to `LedgerData`
- Added functions: `setMarketLabels()`, `getMarketLabels()`, `getAllMarketLabels()`
- Added mutation-safe initialization for `users`, `payments`, and `markets` during writes

### `backend/src/server.ts` (MODIFIED)

- Added imports for `fixturesRouter` and `authRouter`
- Added rate limiting middleware (200 requests per 15 minutes)
- Registered `/api/fixtures` and `/api/auth` routes
- Added `/api/tx/:hash/status` endpoint for checking transaction confirmation status

### `backend/src/routes/auth.ts` (NEW)

- `GET /api/auth/nonce` -- Returns a random nonce string
- `POST /api/auth/verify` -- Accepts SIWE message + signature, verifies, issues JWT (1 day expiry)
- `requireAuth` middleware for protected routes
- Env var: `JWT_SECRET` (defaults to "super-secret-jwt-key")

### `backend/src/routes/fixtures.ts` (NEW)

- `GET /api/fixtures` -- Returns live TxODDS fixture list (via Blitz proxy, 60s cache)
- `GET /api/fixtures/:fixtureId/scores` -- Returns live scores snapshot

### `backend/src/routes/markets.ts` (MODIFIED)

- Added `outcome0Label`, `outcome1Label`, `category`, `stage`, `fixtureId` fields to market responses
- POST /markets now accepts optional `outcome0Label`, `outcome1Label`, `category`, `stage`, `fixtureId` and stores them via `setMarketLabels()`
- POST /markets now returns `marketId` in response
- Added POST /markets/:id/finalize endpoint for the two-step resolution process

### `backend/src/routes/bets.ts` (MODIFIED)

- Changed from synchronous relayer-style betting to async indexing pattern (returns 202 immediately)
- Accepts `txHash` from the frontend instead of `userId` + `outcome` + `amountInj`
- Verifies transactions asynchronously by parsing event logs
- Added GET /users/:userId/balance endpoint with auth guard (returns bets, claims, totals)

### `backend/src/routes/premium.ts` (MODIFIED)

- Moved from mock data to real Gemini AI integration
- Added `@google/genai` package
- Added `GEMINI_API_KEY` env var support
- Now generates real AI insights about pool ratios and market sentiment using Gemini 2.5 Flash
- Uses `recordPayment()` and `isPaymentUsed()` from ledger for replay protection

---

## 4. Complete Environment Variables

### Backend (required)

| Variable | File | Purpose |
|---|---|---|
| `RELAYER_PRIVATE_KEY` | backend/.env | Relayer wallet private key (funded with testnet INJ) |
| `ADMIN_KEY` | backend/.env | Simple password for admin actions (create/resolve markets) |
| `PORT` | backend/.env | Server port (default: 3001) |

### Backend (optional)

| Variable | File | Purpose |
|---|---|---|
| `JWT_SECRET` | backend/.env | Secret key for JWT token signing (defaults to "super-secret-jwt-key") |
| `GEMINI_API_KEY` | backend/.env | Google Gemini API key for premium AI insights |

### Frontend (optional, dev-only)

| Variable | File | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | frontend/.env | Backend base URL for axios (default: http://localhost:3001) |
| `VITE_API_URL` | frontend/.env | Backend API URL for fixture hooks (default: http://localhost:3001/api) |

### Hardhat / Deployment

| Variable | File | Purpose |
|---|---|---|
| `SEPOLIA_RPC_URL` | root .env | RPC URL for deploying to Sepolia |
| `SEPOLIA_PRIVATE_KEY` | root .env | Private key for Sepolia deployments |
| `INJECTIVE_TESTNET_PRIVATE_KEY` | root .env | Private key for Injective testnet deployments |

### cctp-mcp (optional)

| Variable | File | Purpose |
|---|---|---|
| `PRIVATE_KEY` | cctp-mcp/.env | Private key for CCTP bridging operations |

### Scripts

| Variable | File | Purpose |
|---|---|---|
| `VANTAGE_ADMIN_KEY` | env when running scripts | Admin key for seedMarkets.ts |
| `VANTAGE_API_BASE` | env when running scripts | Backend URL for seedMarkets.ts (default: http://localhost:3001) |

**Complete minimal .env for running the project** (these must exist):
```
# backend/.env
RELAYER_PRIVATE_KEY=<required>
ADMIN_KEY=<required>
PORT=3001
JWT_SECRET=<optional, has insecure default>
GEMINI_API_KEY=<optional>
```

Frontend does not require a .env file for dev (Vite proxy handles /api routing).

---

## 5. Full Project Structure (3 levels, excluding node_modules/dist/build artifacts)

```
vantage-main/
  .agents/skills/
    hardhat/SKILL.md
    hardhat-toolbox-mocha-ethers/SKILL.md
  .claude/
    skills/
      hardhat/SKILL.md
      hardhat-toolbox-mocha-ethers/SKILL.md
  .critcache/
    fingerprint.json
  .gitignore
  AGENTS.md
  CLAUDE.md
  CATCHUP.md                           -- This file (NEW)
  HANDOFF.md                           -- Frontend developer handoff doc (NEW)
  README.md
  ball.png                             -- Scroll ball sprite
  celebrate.png                        -- Oracle celebration sprite
  idle.png                             -- Oracle idle sprite
  stamping.png                         -- Oracle stamping sprite
  watching.png                         -- Oracle watching sprite
  hardhat.config.ts
  package.json
  package-lock.json
  tsconfig.json
  artifacts/
    artifacts.d.ts
    build-info/
    contracts/
  backend/
    package.json
    README.md
    tsconfig.json
    data/                               -- Runtime data (ledger.json created here)
    src/
      contract.ts                       -- Ethers contract connection (relayer wallet)
      ledger.ts                         -- LowDB JSON ledger with async-mutex
      server.ts                         -- Express server entry point
      routes/
        auth.ts                         -- SIWE auth routes (NEW)
        bets.ts                         -- Bet/claim indexing + balance endpoint
        fixtures.ts                     -- TxODDS fixture proxy (NEW)
        markets.ts                      -- Market CRUD with labels
        premium.ts                      -- L402 paywalled AI insight
      oracle/
        devnet-wallet.json              -- Auto-generated Solana devnet wallet (NEW)
        download.cjs                    -- Script to download TxODDS IDL (NEW)
        marketCreationLoop.ts           -- Auto-create markets from fixtures (NEW)
        txline.ts                       -- TxODDS subscription + settlement loop (NEW)
        txoracle.json                   -- Anchor IDL for TxODDS devnet program (NEW)
  cctp-mcp/
    .gitignore
    .npmignore
    LICENSE
    README.md
    bin/cli.js
    package.json
    tsconfig.json
    *.ts (various test files)
    src/
      index.ts
      server/
        http-server.ts
        server.ts
      core/
        chains.ts                       -- Includes Injective Testnet (1439)
        config.ts
        prompts.ts
        resources.ts
        tools.ts
        services/
          index.ts
          balance.ts
          blocks.ts
          cctp.ts
          clients.ts
          contracts.ts
          tokens.ts
          transactions.ts
          transfer.ts
          utils.ts
      services/
        circle-paymaster.ts
        circle-paymaster-v08.ts
        real-circle-paymaster.ts
  contracts/
    VantageMarket.sol                   -- Binary prediction market contract
  frontend/
    .gitignore
    index.html
    package.json
    tsconfig.json
    vite.config.ts
    src/
      main.tsx                          -- React entry
      main.ts                           -- Vite vanilla scaffold (UNUSED leftover)
      counter.ts                        -- Vite vanilla scaffold (UNUSED leftover)
      App.tsx                           -- Root component
      style.css                         -- Vite vanilla scaffold (UNUSED leftover)
      types/
        api.ts
      styles/
        global.css
        tokens.css
      lib/
        api.ts
        audio.ts
        contracts.ts
        format.ts
        motion.ts
        useAudio.ts
        wagmi.ts
      contexts/
        AdminContext.tsx
        AudioContext.tsx
        UserContext.tsx
      hooks/
        useAsyncAction.ts
        useFixtures.ts
        useMarkets.ts
        useNavigationState.ts
        useScrollProgress.tsx
        useUserBalance.ts
      services/
        BetService.ts
        MarketService.ts
        PremiumService.ts
        UserService.ts
      pages/
        AdminDashboard.tsx
        Landing.tsx
        MarketDetail.tsx
        MarketsExplorer.tsx
        UserDashboard.tsx
      layouts/
        AppLayout.tsx
      components/
        app/
          ActionButton.tsx
          ActivityFeed.tsx
          AnimatedRoutes.tsx
          AppFooter.tsx
          AppNav.tsx
          BettingForm.tsx
          ClaimButton.tsx
          CommandMenu.tsx
          EmptyState.tsx
          ExplorerSidebar.tsx
          LoaderElements.tsx (FILE DOES NOT EXIST -- imported but missing)
          MarketCard.tsx
          OnboardingTip.tsx
          PageTransition.tsx
          PaywallModal.tsx
          PixelSpinner.tsx
          RouteLoader.tsx
          Skeletons.tsx
          TicketElements.tsx
          WalletConnectionLoader.tsx
          *.module.css (all have corresponding CSS Module files)
        landing/
          AnnotationMark.tsx
          CountUp.tsx
          FAQ.tsx
          GhostSVG.tsx (FILE DOES NOT EXIST -- imported but missing)
          GradientCtaCard.tsx
          Hero.tsx
          HowItWorks.tsx
          IntroSplash.tsx
          MarketCategories.tsx
          MarketsPreview.tsx
          OracleRef.tsx
          PremiumTeaser.tsx
          ScrollBall.tsx
          StatsStrip.tsx
          TransparencyCallout.tsx
          ValueProp.tsx
          WhyVantage.tsx
          *.module.css (all have corresponding CSS Module files)
  ignition/
    modules/VantageMarket.ts
    deployments/chain-1439/
      deployed_addresses.json
      artifacts/VantageMarketModule#VantageMarket.json
      build-info/
      journal.jsonl
  scripts/
    deploy.ts
    seedMarkets.ts                      -- Seeds markets from TxODDS fixture data (NEW)
  test/
    VantageMarket.ts                    -- Hardhat tests
  types/
    ethers-contracts/
```

---

## 6. Incomplete / Broken / Placeholder Items

### Missing Files (imported but don't exist)

- **`frontend/src/components/app/LoaderElements.tsx`** -- Imported by `RouteLoader.tsx`, `WalletConnectionLoader.tsx`, `IntroSplash.tsx`, and `PixelSpinner.tsx`. These files import from `./LoaderElements.module.css` using the `.module.css` extension directly. The CSS module file exists, but the `.tsx` component file is missing. However, the CSS module imports work because these components reference `styles` from the CSS module without needing a separate TypeScript component. This is likely intentional -- the components are standalone and only need the CSS module.
- **`frontend/src/components/landing/GhostSVG.tsx`** -- This file appears in the project file tree from the initial scan but returned `[FILE_DOES_NOT_EXIST]` when read. It is not imported by any other file, so it's likely a planned component that was never created, or was deleted.

### TODO Comments (in source, non-node_modules)

1. **`backend/src/oracle/txline.ts:78`** -- "TODO (unresolved, confirm with TxOdds docs/support before relying on this in production): does an empty array mean 'all leagues' or 'no leagues subscribed'? If it's the latter, this subscription will succeed on-chain but return zero usable World Cup fixture data, which will look like success and silently fail the actual goal."
2. **`backend/src/oracle/txline.ts:228`** -- "TODO: confirm against the contract ABI whether proposeResolution requires a bond (msg.value) per the propose/dispute design already specced. If it's payable and this call doesn't attach a value, expect this to revert"

### console.log Statements (not in node_modules, project source only)

- **`backend/src/server.ts:56`** -- Legitimate server startup log
- **`backend/src/oracle/txline.ts`** -- Multiple console.log statements for subscription flow (intentional logging for oracle operations)
- **`backend/src/oracle/marketCreationLoop.ts`** -- Multiple console.log statements for creation loop (intentional logging)
- **`backend/src/routes/fixtures.ts:32`** -- `console.error("[fixtures] error:", err.message)` -- legitimate error logging
- **`backend/src/routes/premium.ts:65`** -- `console.error("Gemini API error:", err)` -- legitimate error logging
- **`backend/src/routes/bets.ts:48`** -- `console.error("[DEBUG] Index bet error:", err)` -- labeled [DEBUG], could be cleaned up but is non-blocking
- **`scripts/seedMarkets.ts`** -- Heavy use of emoji-prefixed console.log for user-facing script output (intentional)
- **`frontend/src/contexts/UserContext.tsx:64`** -- `console.error('SIWE Error:', err)` -- legitimate error handling
- **`frontend/src/components/app/BettingForm.tsx:71`** -- `console.error(error)` -- error caught and re-thrown, log is redundant but harmless

### Potential Issues

1. **Contract address mismatch**: The handoff document (`HANDOFF.md`) references contract address `0x7978b758432C6F71f386064ef8E271054d943378`, but the actual deployed address in `deployed_addresses.json` and `contract.ts` is `0xD6F18e914D5e81ec7fc01DEC728FF7Aa7C5979b9`. The HANDOFF.md was written before the latest redeployment.

2. **Insecure JWT default**: `backend/src/routes/auth.ts` defaults to `"super-secret-jwt-key"` if `JWT_SECRET` is not set. This is insecure for production.

3. **Vanilla scaffolding still present**: `frontend/src/main.ts` and `frontend/src/counter.ts` and `frontend/src/style.css` are Vite vanilla TypeScript starter files, unused by the React app (which uses `main.tsx`). These are dead code.

4. **Settlement loop runs on import**: `txline.ts` and `marketCreationLoop.ts` both have auto-execution guards (`if (process.argv[1] === __filename)`) that only run when the file is executed directly, not when imported. This is correct behavior.

5. **Rate limiting may break the automated loops**: The backend rate limiter allows 200 requests per 15 minutes. The settlement/creation loops run every 30 seconds, which is 2 requests per minute = 120 per hour = well within limits. But if both loops run simultaneously, they could approach the limit.

6. **Relayer-based claim limitation acknowledged in HANDOFF.md**: The HANDOFF doc notes that multi-user claims are broken because the relayer model means only one on-chain claim can succeed per market. The frontend has been built with wallet-direct writes (`useWriteContract`) for bets and claims, bypassing the relayer -- but the backend indexing endpoints still exist for tracking.

7. **Devnet wallet auto-generated**: `devnet-wallet.json` is overwritten if it doesn't exist, which could cause loss of a funded wallet. The file is currently committed to the repo (contains a private key).

8. **Alchemy API keys hardcoded**: `cctp-mcp/src/core/chains.ts` contains hardcoded Alchemy API keys for various networks. These should be moved to environment variables.

---

## Summary of What Was Added vs Baseline

| Area | Baseline | Current |
|---|---|---|
| Frontend | None | Full React 19 SPA with 5 pages, 30+ components, wagmi wallet, SIWE auth |
| TxODDS Integration | None | Fixture proxy API, Solana devnet subscription, automated market creation & settlement loops |
| Backend Routes | markets, bets, premium | + auth (SIWE), + fixtures (TxODDS proxy), + tx status, + finalize endpoint |
| Backend Ledger | users, payments | + markets (labels, categories, fixture associations) |
| Premium | Mock 402 response | Real Gemini AI insight generation |
| Authentication | None | SIWE + JWT |
| Deployed Contract | 0x7978...4378 | 0xD6F1...79b9 (redeployed) |
| Environment Vars | RELAYER_PRIVATE_KEY, ADMIN_KEY, PORT | + JWT_SECRET, + GEMINI_API_KEY |
| Oracle | None | txline.ts + marketCreationLoop.ts (Solana-based TxODDS oracle) |
