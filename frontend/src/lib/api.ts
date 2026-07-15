import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90_000, // 90s — on-chain txs can take time
});

// Request interceptor: inject x-admin-key if present
api.interceptors.request.use((config) => {
  const adminKey = localStorage.getItem('vantage:adminKey');
  if (adminKey) {
    config.headers['x-admin-key'] = adminKey;
  }
  const token = localStorage.getItem('vantage:token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: normalize error shape
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message: string =
      err.response?.data?.error ??
      err.response?.data?.message ??
      err.message ??
      'An unexpected error occurred';
    // Attach normalized message for easy toast consumption
    err.normalizedMessage = message;
    return Promise.reject(err);
  }
);

/** Extract a human-readable error message from any thrown error */
export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'normalizedMessage' in err) {
    return (err as { normalizedMessage: string }).normalizedMessage;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}
