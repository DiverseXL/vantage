import { api } from '../lib/api';
import type { UserBalance } from '../types/api';

export const UserService = {
  async getUserBalance(userId: string): Promise<UserBalance> {
    const res = await api.get<UserBalance>(`/api/users/${encodeURIComponent(userId)}/balance`);
    return res.data;
  },
};
