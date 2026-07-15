import { useQuery } from '@tanstack/react-query';
import { UserService } from '../services/UserService';
import type { UserBalance } from '../types/api';

const POLL_INTERVAL = 10_000; // 10s

export function useUserBalance(userId: string) {
  return useQuery<UserBalance, Error>({
    queryKey: ['userBalance', userId],
    queryFn: () => UserService.getUserBalance(userId),
    enabled: Boolean(userId), // Only fetch when userId is set
    staleTime: POLL_INTERVAL,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}
