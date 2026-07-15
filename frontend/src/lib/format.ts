/** Formats a wei string (bigint as string) to INJ display value */
export function formatInj(wei: string, decimals = 2): string {
  try {
    const bn = BigInt(wei);
    const injFloat = Number(bn) / 1e18;
    return injFloat.toFixed(decimals);
  } catch {
    return '0.00';
  }
}

/** Formats a unix timestamp (seconds as string) to a readable date */
export function formatTimestamp(ts: string | number): string {
  const ms = typeof ts === 'string' ? parseInt(ts, 10) * 1000 : ts * 1000;
  return new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Truncates a long ID string (e.g. wallet address) for display */
export function truncateId(id: string, start = 6, end = 4): string {
  if (id.length <= start + end + 3) return id;
  return `${id.slice(0, start)}…${id.slice(-end)}`;
}

/** Calculates pool split percentages */
export function getPoolSplit(pool0: string, pool1: string): { pct0: number; pct1: number } {
  const p0 = Number(BigInt(pool0));
  const p1 = Number(BigInt(pool1));
  const total = p0 + p1;
  // Intentional UI default: if pool is 0/0, fallback to 50%/50% visual split 
  // rather than a 0/0 state to show the card in a neutral pre-betting state.
  if (total === 0) return { pct0: 50, pct1: 50 };
  return {
    pct0: Math.round((p0 / total) * 100),
    pct1: Math.round((p1 / total) * 100),
  };
}

/** Injective testnet block explorer link for a tx */
export function explorerTxUrl(txHash: string): string {
  return `https://testnet.blockscout.injective.network/tx/${txHash}`;
}

/** Estimates payout for a winning bet */
export function estimatePayout(
  userBetWei: string,
  totalPool0Wei: string,
  totalPool1Wei: string,
  winningOutcome: '0' | '1'
): string {
  try {
    const bet = BigInt(userBetWei);
    const pool0 = BigInt(totalPool0Wei);
    const pool1 = BigInt(totalPool1Wei);
    const totalPool = pool0 + pool1;
    const winningPool = winningOutcome === '0' ? pool0 : pool1;
    if (winningPool === 0n) return '0.00';
    const payout = (bet * totalPool) / winningPool;
    return formatInj(payout.toString());
  } catch {
    return '0.00';
  }
}
