# Vantage - Frontend Handoff

This document is everything you need to build the frontend against the existing backend and contract. The backend and smart contract are done and tested on Injective EVM Testnet. Your job is the frontend only.

## What Vantage is

A binary prediction market. Users bet on outcome 0 or 1 for a given market (e.g. "Will Team A win?"). When a market resolves, winners split the losing pool proportionally to their stake.

## Architecture you're working against

- Smart contract deployed on Injective EVM Testnet, chain ID 1439
- Contract address: `0xd620B56bFbd43e489656A63C9f9cC1A3dC3d3EF6`
- Backend (Express/TypeScript) wraps the contract via a relayer wallet - this is a custodial model. Users do NOT need their own wallet or gas to bet. You call the backend API, not the contract directly, for all write actions (bet, claim, create, resolve).
- Backend runs locally on `http://localhost:3001` by default.

## Getting the backend running

```
git clone https://github.com/DiverseXL/vantage.git
cd vantage/backend
npm install
```

Create `backend/.env` (this file is gitignored, you must create it yourself, it will not come from the repo):

```
RELAYER_PRIVATE_KEY=<ask the project owner for this - do not generate your own, it must be the funded relayer wallet>
ADMIN_KEY=<ask the project owner for this>
PORT=3001
```

Run it:

```
npm run dev
```

You should see `Vantage backend listening on port 3001`.

Note: write requests (bet, claim, create, resolve) are real on-chain transactions against Injective testnet. They can take anywhere from a few seconds to a minute or so to confirm, since the backend waits for on-chain confirmation before responding. Design your frontend loading states accordingly - do not assume instant responses on any POST route.

## API Reference

All routes are prefixed `/api` except `/health`.

### `GET /health`
Returns `{"status":"ok"}`. Use this to confirm the backend is reachable.

### `GET /api/markets`
Returns all markets.

Response:
```json
{
  "markets": [
    {
      "id": "0",
      "description": "Will Team A win the match?",
      "resolved": false,
      "winningOutcome": "0",
      "totalPool0": "50000000000000000",
      "totalPool1": "72000000000000000",
      "creationTimestamp": "1783598053"
    }
  ]
}
```

Note: pool amounts are in wei (18 decimals, INJ). Use `ethers.formatEther()` or equivalent to display as INJ.

### `GET /api/markets/:id`
Returns a single market, same shape as above (without the wrapping array).

### `POST /api/markets` (admin)
Creates a new market.

Headers: `x-admin-key: <ADMIN_KEY>`, `Content-Type: application/json`

Body:
```json
{ "description": "Will Team A win the match?" }
```

Response: `{ "txHash": "0x..." }`

### `POST /api/markets/:id/resolve` (admin)
Resolves a market to a winning outcome.

Headers: `x-admin-key: <ADMIN_KEY>`, `Content-Type: application/json`

Body:
```json
{ "winningOutcome": 0 }
```

Response: `{ "txHash": "0x..." }`

### `POST /api/markets/:id/bet`
Places a bet.

Body:
```json
{ "userId": "some-user-identifier", "outcome": 0, "amountInj": "0.01" }
```

- `outcome` must be `0` or `1`
- `amountInj` is a string, denominated in INJ (not wei)
- `userId` is any string you choose to identify the user in the backend's local ledger - there is no auth system, this is a hackathon demo. Use something like a session ID or wallet address string if the user connects a wallet on the frontend, or just a hardcoded value for single-user demo purposes.

Response:
```json
{ "txHash": "0x...", "marketId": "0", "outcome": 0, "amountInj": "0.01" }
```

### `POST /api/markets/:id/claim`
Claims payout after a market resolves.

Body:
```json
{ "userId": "some-user-identifier" }
```

Response:
```json
{ "txHash": "0x...", "marketId": "0", "payoutAmountInj": "0.122" }
```

**Important limitation - read this before building claim UI:** the backend uses one relayer wallet for all users under the hood. The contract itself only knows about the relayer's address, not individual userIds. This means:
- Only one on-chain claim can happen per market (the relayer's total winning position), regardless of how many different `userId`s placed bets.
- If you call `/claim` for a second `userId` on a market that's already been claimed, it will fail on-chain with "Payout already claimed."
- This is fine for a single-user demo flow (one person betting and claiming through the UI). It is NOT currently safe for a live multi-user demo where multiple real people bet and expect to claim independently.
- Do not build a multi-user claim flow expecting this to work correctly yet. If you need this fixed, flag it to the project owner - it requires a contract change (per-address bet/claim tracking via a relayer-authorized function) that hasn't been done.

### `GET /api/users/:userId/balance`
Returns a given userId's local ledger record (their bets and claims as tracked off-chain, for display purposes).

Response:
```json
{
  "userId": "some-user-identifier",
  "bets": [{ "marketId": 0, "outcome": 0, "amountInj": "0.01", "timestamp": 1234567890, "txHash": "0x..." }],
  "claims": [{ "marketId": 0, "payoutAmountInj": "0.122", "timestamp": 1234567890, "txHash": "0x..." }],
  "totalBetInj": 0.01,
  "totalClaimedInj": 0.122
}
```

### `GET /api/premium-stats/:marketId` (x402-gated, optional for MVP UI)
Demonstrates the x402 payment-required pattern. Not required for core betting UI - only build this into the frontend if you want to show off the x402 integration specifically.

Without an `x-payment-tx` header, returns HTTP 402 with payment instructions:
```json
{
  "error": "Payment required",
  "amountInj": "0.001",
  "payTo": "0x11294A6fB435FF573b770a88B91551653D4Ec3b5",
  "network": "Injective EVM Testnet",
  "chainId": 1439,
  "instructions": "Send the amountInj to payTo, then retry this request with header x-payment-tx set to your transaction hash."
}
```

With a valid `x-payment-tx` header (a real transaction hash sending at least 0.001 INJ to `payTo`), returns HTTP 200 with mock premium data. Each transaction hash can only be used once (replay protection).

## Error handling

All routes return errors as:
```json
{ "error": "description of what went wrong" }
```
with an appropriate HTTP status (400 for bad input, 401 for missing/wrong admin key, 500 for contract/transaction failures). Always handle non-200 responses in the frontend and surface the `error` message to the user.

## Contract reference (only needed if you want to read from the contract directly instead of via the backend - not required)

- ✅ **Updated**: `0xd620B56bFbd43e489656A63C9f9cC1A3dC3d3EF6`
  - Old (outdated): `0x7978b758432C6F71f386064ef8E271054d943378`
- Network: Injective EVM Testnet, chain ID 1439
- RPC URL: `https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/`
  - Do NOT use `https://k8s.testnet.json-rpc.injective.network/` - this endpoint is known to silently drop broadcast transactions (accepts and returns a hash but never mines it). Confirmed via direct testing. Always use the archival endpoint above.
- Explorer: `https://testnet.blockscout.injective.network/`
- ABI: found in the repo at `artifacts/contracts/VantageMarket.sol/VantageMarket.json` after running `npx hardhat compile` from the repo root (this file is gitignored and not committed, you'll need to compile it yourself if you need it - only necessary if reading from the contract directly).

## Things to ask the project owner for

- `RELAYER_PRIVATE_KEY` value (needed to run the backend at all)
- `ADMIN_KEY` value (needed for create/resolve market actions)

Do not commit either of these to git under any circumstances. `.env` is already gitignored at the repo root and in `backend/`.

## Known gaps / in-progress work (not your concern, just context)

- CCTP cross-chain USDC bridging: config added for Injective testnet, not yet live-tested end to end.
- MCP server (natural language betting via `place_bet`/`get_markets` tools): not yet built.
- These do not block frontend work. Build against the API routes above.
