/**
 * scripts/seedMarkets.ts
 *
 * Batch-creates World Cup markets from REAL TxOdds fixture data.
 * Uses our own /api/fixtures proxy endpoint — no devnet wallet funding needed.
 *
 * Field names are CONFIRMED from live API response logged at:
 *   GET http://localhost:3001/api/fixtures
 * Verified shape:
 *   { FixtureId, Participant1, Participant1Id, Participant2, Participant2Id,
 *     Competition, CompetitionId, StartTime (unix ms), GameState? }
 *
 * Usage:
 *   VANTAGE_ADMIN_KEY=<your-key> npx tsx scripts/seedMarkets.ts
 */

import axios from "axios";

const API_BASE = process.env.VANTAGE_API_BASE ?? "http://localhost:3001";
const ADMIN_KEY = process.env.VANTAGE_ADMIN_KEY;

if (!ADMIN_KEY) {
  console.error("❌ Set VANTAGE_ADMIN_KEY before running this script.");
  process.exit(1);
}

// Delay between creates — respects the backend rate limiter and avoids
// hammering the relayer with back-to-back on-chain transactions.
const DELAY_MS = 3_500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Confirmed TxOdds fixture shape ───────────────────────────────────────
interface TxFixture {
  FixtureId: number;
  Participant1: string;
  Participant1Id: number;
  Participant2: string;
  Participant2Id: number;
  Competition: string;
  CompetitionId: number;
  StartTime: number; // unix ms
  GameState?: number; // 0/1=pre, 2=live, 3=HT, 4=FT
}

async function fetchFixtures(): Promise<TxFixture[]> {
  const res = await axios.get(`${API_BASE}/api/fixtures`, { timeout: 15_000 });
  // Our proxy returns a flat array
  return Array.isArray(res.data) ? res.data : (res.data.value ?? []);
}

async function createMarket(payload: {
  description: string;
  stage: string;
  category: string;
  outcome0Label: string;
  outcome1Label: string;
  fixtureId?: number;
}): Promise<void> {
  try {
    const res = await axios.post(`${API_BASE}/api/markets`, payload, {
      headers: { "x-admin-key": ADMIN_KEY },
      timeout: 30_000,
    });
    const id = res.data.marketId ?? "(id not returned)";
    console.log(`  ✅ Created market ${id}: "${payload.description}"`);
  } catch (err: any) {
    const detail = err.response?.data?.error ?? err.message;
    console.error(`  ❌ Failed: "${payload.description}" — ${detail}`);
  }
}

async function seed() {
  console.log("📡 Fetching fixtures from TxOdds proxy...");
  const fixtures = await fetchFixtures();
  console.log(`   Found ${fixtures.length} fixtures total.`);

  // ── 1. World Cup match-winner markets ────────────────────────────────
  // Only include fixtures where Competition is "World Cup" (CompetitionId 72
  // confirmed from live data). Finished matches (GameState 4) are skipped —
  // creating a market for a match that already ended would be misleading.
  const worldCupFixtures = fixtures.filter(
    (f) => f.CompetitionId === 72 && f.GameState !== 4
  );

  console.log(`\n🏆 Creating ${worldCupFixtures.length} World Cup match-winner markets...`);

  for (const fixture of worldCupFixtures) {
    const description = `Will ${fixture.Participant1} beat ${fixture.Participant2}?`;
    await createMarket({
      description,
      stage: "Group Stage",
      category: "Match Winner",
      outcome0Label: fixture.Participant1,
      outcome1Label: `Not ${fixture.Participant1}`,
      fixtureId: fixture.FixtureId,
    });
    await sleep(DELAY_MS);
  }

  // ── 2. Tournament outright markets — binary per contender ────────────
  // Binary contract = one "Will X win?" per team rather than a
  // 32-way multi-outcome. Pool from all parallel markets collectively
  // reflects aggregate market confidence in each team.
  //
  // List: teams with FixtureIds confirmed in the current TxOdds snapshot.
  // Add/remove as the real fixture list expands.
  const outrightContenders = [
    { name: "England",     participantId: 1888 },
    { name: "Argentina",   participantId: 1489 },
    { name: "Brazil",      participantId: 1634 },
    { name: "Australia",   participantId: 1519 },
    { name: "New Zealand", participantId: 1225 },
  ];

  console.log(`\n🥇 Creating ${outrightContenders.length} Tournament Outright markets...`);

  for (const contender of outrightContenders) {
    const description = `Will ${contender.name} win the 2026 World Cup?`;
    await createMarket({
      description,
      stage: "Tournament",
      category: "Tournament Outright",
      outcome0Label: contender.name,
      outcome1Label: `Not ${contender.name}`,
    });
    await sleep(DELAY_MS);
  }

  console.log("\n✅ Seeding complete.");
}

seed().catch((err) => {
  console.error("Seeding script crashed:", err.message);
  process.exit(1);
});
