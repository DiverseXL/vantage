import { getFixtures, subscribeAndActivate } from "./txline.js";
import { vantageMarketContract } from "../contract.js";
import { getAllMarketLabels, setMarketLabels } from "../ledger.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

export async function runCreationLoop() {
  console.log("Starting Oracle Market Creation Loop...");
  const { apiToken, jwt } = await subscribeAndActivate();

  setInterval(async () => {
    try {
      console.log("[Creation] Fetching TxLINE snapshot for new fixtures...");
      const fixtures = await getFixtures(apiToken, jwt);

      const labelsMap = getAllMarketLabels();
      // Gather all existing fixture IDs that have already been created
      const existingFixtureIds = new Set<number>();
      for (const key in labelsMap) {
        if (labelsMap[key] && labelsMap[key].fixtureId !== undefined) {
          existingFixtureIds.add(labelsMap[key].fixtureId!);
        }
      }

      // Filter for World Cup (72) and exclude finished games (4)
      const worldCupFixtures = fixtures.filter(
        (f: any) => f.CompetitionId === 72 && f.GameState !== 4
      );

      for (const fixture of worldCupFixtures) {
        if (existingFixtureIds.has(fixture.FixtureId)) {
          continue; // Market already exists for this fixture
        }

        const description = `Will ${fixture.Participant1} beat ${fixture.Participant2}?`;
        console.log(`[Creation] New fixture detected: ${fixture.FixtureId}. Creating market...`);

        try {
          const tx = await (vantageMarketContract as any).createMarket(description);
          console.log(`[Creation] Submitted tx to create market: ${tx.hash}`);
          await tx.wait();

          // After wait, we need to determine the new market ID.
          // Because we don't have events parsed cleanly here, and nextMarketId tracks the length:
          const nextId: bigint = await (vantageMarketContract as any).nextMarketId();
          const newMarketId = (nextId - 1n).toString();

          const outcome0Label = fixture.Participant1;
          const outcome1Label = `Not ${fixture.Participant1}`;

          await setMarketLabels(
            newMarketId,
            outcome0Label,
            outcome1Label,
            "Match Winner",
            "Group Stage",
            fixture.FixtureId
          );

          console.log(`✅ [Creation] Successfully linked market ${newMarketId} to fixture ${fixture.FixtureId}`);
          
          // Add to set to prevent double creation in same tick
          existingFixtureIds.add(fixture.FixtureId);

        } catch (err: any) {
          console.error(`❌ [Creation] Failed to create market for fixture ${fixture.FixtureId}:`, err.message);
        }
      }
    } catch (err) {
      console.error("[Creation] loop error:", err);
    }
  }, 30000); // Check every 30s
}

// Run it
if (process.argv[1] && (process.argv[1] === __filename || process.argv[1].endsWith("marketCreationLoop.ts"))) {
  runCreationLoop().catch(console.error);
}
