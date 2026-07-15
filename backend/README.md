# Vantage Backend

The backend is an Express/TypeScript REST API that wraps the `VantageMarket.sol` Solidity contract on the Injective EVM testnet. It uses a custodial relayer wallet pattern to submit transactions on behalf of users, avoiding the need for users to sign Web3 transactions in the frontend.

## Architecture

- **Node/Express**: Serves the REST API.
- **Ethers.js**: Connects to the Injective EVM testnet (Chain ID 1439) using a funded relayer private key.
- **Lowdb + Async-Mutex**: Serves as a lightweight JSON ledger to track user balances, bets, claims, and custom market metadata (like outcome labels). The `async-mutex` ensures concurrent writes to the JSON file do not corrupt data.

## Getting Started

### Prerequisites

1. Run `npm install`
2. Create a `.env` file in this directory based on the `.env.example` (or with the required variables).
   - `RELAYER_PRIVATE_KEY`: Private key funded with testnet INJ.
   - `ADMIN_KEY`: Simple password used by the frontend to authenticate admin actions.
   - `PORT`: Port to run the server on (default 3001).

### Running

- **Development**: `npm run dev` (uses `tsx watch` for hot-reloading).
- **Production build**: `npm run build` then `npm start`.

## Key Endpoints

- `GET /api/markets`: Fetches all markets (reads from contract + merges labels from ledger).
- `POST /api/markets`: (Admin) Creates a new market.
- `POST /api/markets/:id/resolve`: (Admin) Resolves a market.
- `POST /api/markets/:id/bet`: Places a bet using the relayer. Returns `202 Accepted` immediately and confirms the tx asynchronously.
- `POST /api/markets/:id/claim`: Claims payout for a winning bet. Returns `202 Accepted` immediately.
- `GET /api/tx/:hash/status`: Checks the on-chain confirmation status of a pending transaction.
- `GET /api/users/:userId/balance`: Returns all bets and claims for a given user.
- `POST /api/premium/:marketId`: Generates a fake 402 L402 payment required response for premium insights.
- `GET /api/premium/:marketId/insight`: Verifies an on-chain INJ transfer and returns an AI insight.
