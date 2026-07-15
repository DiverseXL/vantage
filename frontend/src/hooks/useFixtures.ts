import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export interface TxFixture {
  FixtureId: number;
  Participant1: string;
  Participant1Id: number;
  Participant2: string;
  Participant2Id: number;
  Competition: string;
  CompetitionId: number;
  FixtureGroupId: number;
  StartTime: number; // unix ms
  Ts: number;
  GameState?: number; // 0=not started, 1=pre-match, 2=live, 3=half-time, 4=finished
  Participant1IsHome?: boolean;
}

export interface TxFixtureScores {
  FixtureId: number;
  Participant1Score?: number;
  Participant2Score?: number;
  Stats?: Record<string, any>;
  Events?: Array<{
    Minute: number;
    Type: string;
    Team: string;
    Player?: string;
  }>;
}

async function fetchFixtures(): Promise<TxFixture[]> {
  const res = await fetch(`${API_BASE}/fixtures`);
  if (!res.ok) throw new Error('Failed to fetch fixtures');
  const data = await res.json();
  // TxOdds returns either an array or { value: [...] }
  return Array.isArray(data) ? data : (data.value ?? []);
}

async function fetchFixtureScores(fixtureId: number): Promise<TxFixtureScores> {
  const res = await fetch(`${API_BASE}/fixtures/${fixtureId}/scores`);
  if (!res.ok) throw new Error('Failed to fetch fixture scores');
  return res.json();
}

export function useFixtures() {
  return useQuery<TxFixture[]>({
    queryKey: ['txodds-fixtures'],
    queryFn: fetchFixtures,
    staleTime: 60_000, // refresh every 60s
    retry: 2,
  });
}

export function useFixtureScores(fixtureId: number | null) {
  return useQuery<TxFixtureScores>({
    queryKey: ['txodds-scores', fixtureId],
    queryFn: () => fetchFixtureScores(fixtureId!),
    enabled: fixtureId != null,
    staleTime: 15_000, // refresh every 15s for live data
    refetchInterval: 20_000,
  });
}

// Utility: map TxOdds participant IDs to ISO 3166-1 alpha-2 country codes
// for flagcdn.com
const TEAM_FLAG_MAP: Record<number, string> = {
  1888: 'gb-eng', // England
  1489: 'ar',     // Argentina
  1634: 'br',     // Brazil
  1519: 'au',     // Australia
  1378: 'vn',     // Vietnam
  1215: 'mm',     // Myanmar
  1225: 'nz',     // New Zealand
  1144: 'in',     // India
  // Add more as fixtures expand
};

export function teamFlagCode(participantId: number): string {
  return TEAM_FLAG_MAP[participantId] ?? 'un'; // 'un' = United Nations flag as fallback
}

export function gameStateLabel(state?: number): 'upcoming' | 'live' | 'finished' {
  if (state === 2 || state === 3) return 'live';
  if (state === 4) return 'finished';
  return 'upcoming';
}
