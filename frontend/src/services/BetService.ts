import { api } from '../lib/api';
import type { PlaceBetResponse, ClaimResponse } from '../types/api';

export const BetService = {
  async indexBet(
    marketId: string,
    txHash: string
  ): Promise<PlaceBetResponse> {
    const res = await api.post<PlaceBetResponse>(
      `/api/markets/${marketId}/bet`,
      { txHash }
    );
    return res.data;
  },

  async indexClaim(
    marketId: string,
    txHash: string
  ): Promise<ClaimResponse> {
    const res = await api.post<ClaimResponse>(
      `/api/markets/${marketId}/claim`,
      { txHash }
    );
    return res.data;
  },
};
