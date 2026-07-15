import { Router, type Request, type Response } from "express";
import { ethers } from "ethers";
import { vantageMarketContract, provider } from "../contract.js";
import { recordBet, recordClaim, getUserBets, getUserClaims } from "../ledger.js";
import { requireAuth } from "./auth.js";

export const betsRouter = Router();

betsRouter.post("/markets/:id/bet", async (req: Request, res: Response) => {
    try {
        const marketId = req.params.id!;
        const { txHash } = req.body;

        if (!txHash || typeof txHash !== "string") {
            res.status(400).json({ error: "txHash (string) is required" });
            return;
        }

        // Return 202 immediately, indexing is done async
        res.status(202).json({
            txHash,
            status: "indexing",
            marketId
        });

        // Async verification
        provider.getTransactionReceipt(txHash).then(async (receipt) => {
            if (!receipt || receipt.status !== 1) return; // Reverted or not mined
            
            // Extract event log
            const betEvent = receipt.logs
                .map((log: any) => {
                    try {
                        return vantageMarketContract.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find((parsed: any) => parsed?.name === "BetPlaced");

            if (betEvent) {
                const eventMarketId = betEvent.args[0].toString();
                const bettor = betEvent.args[1].toLowerCase();
                const outcome = Number(betEvent.args[2]);
                const amountInj = ethers.formatEther(betEvent.args[3]);

                // Ensure it matches the expected market
                if (eventMarketId === marketId) {
                    await recordBet(bettor, Number(marketId), outcome, amountInj, receipt.hash);
                }
            }
        }).catch((err) => console.error("[DEBUG] Index bet error:", err));

    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ error: (err as Error).message });
        }
    }
});

betsRouter.post("/markets/:id/claim", async (req: Request, res: Response) => {
    try {
        const marketId = req.params.id!;
        const { txHash } = req.body;

        if (!txHash || typeof txHash !== "string") {
            res.status(400).json({ error: "txHash (string) is required" });
            return;
        }

        // Return 202 immediately
        res.status(202).json({
            txHash,
            status: "indexing",
            marketId
        });

        provider.getTransactionReceipt(txHash).then(async (receipt) => {
            if (!receipt || receipt.status !== 1) return;

            const payoutEvent = receipt.logs
                .map((log: any) => {
                    try {
                        return vantageMarketContract.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find((parsed: any) => parsed?.name === "PayoutClaimed");

            if (payoutEvent) {
                const eventMarketId = payoutEvent.args[0].toString();
                const bettor = payoutEvent.args[1].toLowerCase();
                const payoutAmountInj = ethers.formatEther(payoutEvent.args[2]);

                if (eventMarketId === marketId) {
                    await recordClaim(bettor, Number(marketId), payoutAmountInj, receipt.hash);
                }
            }
        }).catch((err) => console.error("[DEBUG] Index claim error:", err));

    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ error: (err as Error).message });
        }
    }
});

betsRouter.get("/users/:userId/balance", requireAuth, (req: Request, res: Response) => {
    const rawUserId = req.params.userId as string;
    if (!rawUserId) {
        res.status(400).json({ error: "userId is required" });
        return;
    }
    const userId = String(rawUserId).toLowerCase();
    
    if ((req as any).user.address !== userId) {
        res.status(403).json({ error: "Forbidden: can only access your own balance" });
        return;
    }

    const bets = getUserBets(userId);
    const claims = getUserClaims(userId);

    const totalBetInj = bets.reduce((sum, b) => sum + Number(b.amountInj), 0);
    const totalClaimedInj = claims.reduce((sum, c) => sum + Number(c.payoutAmountInj), 0);

    res.json({
        userId,
        bets,
        claims,
        totalBetInj,
        totalClaimedInj,
    });
});