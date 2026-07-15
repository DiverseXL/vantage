import axios from 'axios';
import { api } from '../lib/api';
import type { PremiumStatsResponse, PaymentRequiredBody } from '../types/api';

export const PremiumService = {
  /** Fetch premium stats. Throws a 402 error if payment is needed. */
  async getInsight(
    marketId: string,
    txHash: string
  ): Promise<PremiumStatsResponse> {
    const res = await api.get<PremiumStatsResponse>(
      `/api/premium-stats/${marketId}`,
      { headers: { 'x-payment-tx': txHash } }
    );
    return res.data;
  },

  /** Fetch payment instructions (deliberately calls without txHash to get 402 body) */
  async getPaymentInstructions(
    marketId: string
  ): Promise<PaymentRequiredBody> {
    try {
      await api.get(`/api/premium-stats/${marketId}`);
      // Should never 200 without payment; return a fallback
      throw new Error('Unexpected 200 response when fetching payment instructions');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 402) {
        return err.response.data as PaymentRequiredBody;
      }
      throw err;
    }
  },
};
