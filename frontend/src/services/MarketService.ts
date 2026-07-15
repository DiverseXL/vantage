import { api } from '../lib/api';
import type {
  Market,
  MarketsResponse,
  CreateMarketResponse,
  ResolveMarketResponse,
} from '../types/api';

export const MarketService = {
  async getMarkets(): Promise<Market[]> {
    const res = await api.get<MarketsResponse>('/api/markets');
    return res.data.markets;
  },

  async getMarket(id: string): Promise<Market> {
    const res = await api.get<Market>(`/api/markets/${id}`);
    return res.data;
  },

  async createMarket(
    description: string,
    outcome0Label?: string,
    outcome1Label?: string
  ): Promise<CreateMarketResponse> {
    const res = await api.post<CreateMarketResponse>('/api/markets', {
      description,
      ...(outcome0Label ? { outcome0Label } : {}),
      ...(outcome1Label ? { outcome1Label } : {}),
    });
    return res.data;
  },

  async resolveMarket(
    id: string,
    winningOutcome: 0 | 1
  ): Promise<ResolveMarketResponse> {
    const res = await api.post<ResolveMarketResponse>(
      `/api/markets/${id}/resolve`,
      { winningOutcome }
    );
    return res.data;
  },

  async finalizeResolution(id: string): Promise<ResolveMarketResponse> {
    const res = await api.post<ResolveMarketResponse>(`/api/markets/${id}/finalize`);
    return res.data;
  },
};
