// Shared TypeScript types for all API response shapes

export interface Market {
  id: string;
  description: string;
  resolved: boolean;
  winningOutcome: string; // "0" or "1"
  totalPool0: string;     // wei string
  totalPool1: string;     // wei string
  creationTimestamp: string;
  // Phase 8.7 additions (may be null on legacy markets)
  outcome0Label?: string | null;
  outcome1Label?: string | null;
  category?: string;
  stage?: string;
  // Two-step resolution fields
  resolutionProposed?: boolean;
  proposedOutcome?: string;
  challengeWindowEndTime?: string;
}

export interface MarketsResponse {
  markets: Market[];
}

export interface Bet {
  marketId: number;
  outcome: number;
  amountInj: string;
  timestamp: number;
  txHash: string;
}

export interface Claim {
  marketId: number;
  payoutAmountInj: string;
  timestamp: number;
  txHash: string;
}

export interface UserBalance {
  userId: string;
  bets: Bet[];
  claims: Claim[];
  totalBetInj: number;
  totalClaimedInj: number;
}

export interface PlaceBetResponse {
  txHash: string;
  marketId: string;
  outcome: number;
  amountInj: string;
}

export interface ClaimResponse {
  txHash: string;
  marketId: string;
  payoutAmountInj: string;
}

export interface CreateMarketResponse {
  txHash: string;
  marketId?: string; // Added in Phase 8.8 — may be absent on older backend
}

export interface ResolveMarketResponse {
  txHash: string;
}

export interface PremiumStatsResponse {
  marketId: string;
  premiumInsight: string;
  generatedAt: string;
}

// 402 response shape from premium endpoint
export interface PaymentRequiredBody {
  error: string;
  amountInj: string;
  payTo: string;
  network: string;
  chainId: number;
  instructions: string;
}

export interface TxStatusResponse {
  status: 'pending' | 'confirmed' | 'failed' | 'not_found';
}
