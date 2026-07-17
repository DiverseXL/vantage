import { Router, type Request, type Response } from "express";
import { vantageMarketContract } from "../contract.js";
import { setMarketLabels, getMarketLabels } from "../ledger.js";

export const marketsRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
    const adminKey = req.header("x-admin-key");
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        res.status(401).json({ error: "Unauthorized: missing or invalid x-admin-key" });
        return false;
    }
    return true;
}

marketsRouter.get("/markets", async (_req: Request, res: Response) => {
    try {
        const nextId: bigint = await (vantageMarketContract as any).nextMarketId();
        const markets = [];
        for (let i = 0n; i < nextId; i++) {
            const m = await (vantageMarketContract as any).markets(i);
            const labels = getMarketLabels(i.toString());
            markets.push({
                id: i.toString(),
                description: m.description,
                resolved: m.resolved,
                winningOutcome: m.winningOutcome.toString(),
                totalPool0: m.totalPool0.toString(),
                totalPool1: m.totalPool1.toString(),
                creationTimestamp: m.creationTimestamp.toString(),
                resolutionProposed: m.resolutionProposed,
                proposedOutcome: m.proposedOutcome.toString(),
                challengeWindowEndTime: m.challengeWindowEndTime.toString(),
                outcome0Label: labels?.outcome0Label,
                outcome1Label: labels?.outcome1Label,
                category: labels?.category,
                stage: labels?.stage,
                fixtureId: labels?.fixtureId,
            });
        }
        res.json({ markets });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

marketsRouter.get("/markets/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const nextId: bigint = await (vantageMarketContract as any).nextMarketId();
        if (BigInt(id) >= nextId) {
            res.status(404).json({ error: "Market not found" });
            return;
        }
        const m = await (vantageMarketContract as any).markets(id);
        const labels = getMarketLabels(id);
        res.json({
            id,
            description: m.description,
            resolved: m.resolved,
            winningOutcome: m.winningOutcome.toString(),
            totalPool0: m.totalPool0.toString(),
            totalPool1: m.totalPool1.toString(),
            creationTimestamp: m.creationTimestamp.toString(),
            resolutionProposed: m.resolutionProposed,
            proposedOutcome: m.proposedOutcome.toString(),
            challengeWindowEndTime: m.challengeWindowEndTime.toString(),
            outcome0Label: labels?.outcome0Label,
            outcome1Label: labels?.outcome1Label,
            category: labels?.category,
            stage: labels?.stage,
            fixtureId: labels?.fixtureId,
        });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

marketsRouter.post("/markets", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { description, outcome0Label, outcome1Label, category, stage, fixtureId } = req.body;
        if (!description || typeof description !== "string") {
            res.status(400).json({ error: "description (string) is required" });
            return;
        }
        
        const tx = await (vantageMarketContract as any).createMarket(description);
        const receipt = await tx.wait();
        
        // Find the market ID by querying the contract
        const nextId: bigint = await (vantageMarketContract as any).nextMarketId();
        const marketId = (nextId - 1n).toString();
        
        // Save custom labels if provided
        await setMarketLabels(
            marketId, 
            outcome0Label || "Option A", 
            outcome1Label || "Option B",
            category,
            stage,
            fixtureId
        );
        
        res.json({ txHash: receipt.hash, marketId });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

marketsRouter.post("/markets/:id/resolve", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { winningOutcome } = req.body;
        if (winningOutcome !== 0 && winningOutcome !== 1) {
            res.status(400).json({ error: "winningOutcome must be 0 or 1" });
            return;
        }
        const tx = await (vantageMarketContract as any).proposeResolution(req.params.id as string, winningOutcome);
        const receipt = await tx.wait();
        res.json({ txHash: receipt.hash });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

marketsRouter.post("/markets/:id/finalize", async (req: Request, res: Response) => {
    try {
        const tx = await (vantageMarketContract as any).finalizeResolution(req.params.id as string);
        const receipt = await tx.wait();
        res.json({ txHash: receipt.hash });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});