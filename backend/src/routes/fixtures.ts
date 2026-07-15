import { Router, type Request, type Response } from "express";
import axios from "axios";

// Blitz's public TxOdds proxy — same data, no auth required.
// Once a TxOdds subscription is activated (txline.ts), swap these
// PROXY_BASE URLs for the direct TxOdds endpoints with your API token.
const PROXY_BASE = "https://blitz-pied.vercel.app/api/proxy";

// Simple in-memory cache — refresh every 60s to avoid hammering the proxy
let fixtureCache: { data: any; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

export const fixturesRouter = Router();

/**
 * GET /api/fixtures
 * Returns the live TxOdds fixture list (World Cup + Friendlies).
 * Fields per fixture:
 *   FixtureId, Participant1, Participant2, Competition, StartTime (ms unix),
 *   GameState (0=not started, 1=pre-match, 2=live, 4=finished)
 */
fixturesRouter.get("/fixtures", async (_req: Request, res: Response) => {
    try {
        const now = Date.now();
        if (fixtureCache && now - fixtureCache.ts < CACHE_TTL) {
            res.json(fixtureCache.data);
            return;
        }

        const txRes = await axios.get(`${PROXY_BASE}/fixtures`, { timeout: 12000 });
        const payload = txRes.data;
        fixtureCache = { data: payload, ts: now };
        res.json(payload);
    } catch (err: any) {
        console.error("[fixtures] error:", err.message);
        // Return stale cache if available rather than erroring
        if (fixtureCache) {
            res.json(fixtureCache.data);
            return;
        }
        res.status(502).json({ error: "Failed to fetch fixtures", detail: err.message });
    }
});

/**
 * GET /api/fixtures/:fixtureId/scores
 * Returns live scores snapshot for a specific fixture (for live match pages).
 * Fields include: Participant1Score, Participant2Score, Stats (possession etc),
 * and Events (goals, corners, cards).
 */
fixturesRouter.get("/fixtures/:fixtureId/scores", async (req: Request, res: Response) => {
    try {
        const { fixtureId } = req.params;
        const txRes = await axios.get(
            `${PROXY_BASE}/scores-snapshot/${fixtureId}`,
            { timeout: 12000 }
        );
        res.json(txRes.data);
    } catch (err: any) {
        console.error("[fixtures/scores] error:", err.message);
        res.status(502).json({ error: "Failed to fetch scores", detail: err.message });
    }
});
