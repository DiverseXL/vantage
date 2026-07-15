import { useQuery } from '@tanstack/react-query';
import { MarketService } from '../services/MarketService';
import type { Market } from '../types/api';

const POLL_INTERVAL = 10_000; // 10s

export function useMarkets() {
  return useQuery<Market[], Error>({
    queryKey: ['markets'],
    queryFn: () => MarketService.getMarkets(),
    staleTime: POLL_INTERVAL,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useMarket(id: string) {
  return useQuery<Market, Error>({
    queryKey: ['market', id],
    queryFn: () => MarketService.getMarket(id),
    enabled: Boolean(id),
    staleTime: POLL_INTERVAL,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}
