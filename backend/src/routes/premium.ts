import { Router, type Request, type Response } from "express";
import { ethers } from "ethers";
import { provider, relayerWallet, vantageMarketContract } from "../contract.js";
import { recordPayment, isPaymentUsed } from "../ledger.js";
import { GoogleGenAI } from "@google/genai";

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export const premiumRouter = Router();

const PAYMENT_AMOUNT_INJ = "0.001";
const PAYMENT_ENDPOINT = "premium-stats";
const CHAIN_ID = 1439;

premiumRouter.get("/premium-stats/:marketId", async (req: Request, res: Response) => {
    const txHash = req.header("x-payment-tx");
    const relayerAddress = relayerWallet.address;

    if (!txHash) {
        res.status(402).json({
            error: "Payment required",
            amountInj: PAYMENT_AMOUNT_INJ,
            payTo: relayerAddress,
            network: "Injective EVM Testnet",
            chainId: CHAIN_ID,
            instructions:
                "Send the amountInj to payTo, then retry this request with header x-payment-tx set to your transaction hash.",
        });
        return;
    }

    if (isPaymentUsed(txHash)) {
        res.status(402).json({ error: "Payment already used, replay not allowed" });
        return;
    }

    let tx: ethers.TransactionResponse | null;
    try {
        tx = await provider.getTransaction(txHash);
    } catch {
        res.status(402).json({ error: "Failed to fetch transaction from network" });
        return;
    }

    if (!tx) {
        res.status(402).json({ error: "Transaction not found on network" });
        return;
    }

    if (!tx.to || tx.to.toLowerCase() !== relayerAddress.toLowerCase()) {
        res.status(402).json({
            error: "Payment verification failed: transaction recipient does not match the required payTo address",
        });
        return;
    }

    const requiredValue = ethers.parseEther(PAYMENT_AMOUNT_INJ);
    if (tx.value < requiredValue) {
        res.status(402).json({
            error: `Payment verification failed: transaction value ${ethers.formatEther(tx.value)} INJ is less than required ${PAYMENT_AMOUNT_INJ} INJ`,
        });
        return;
    }

    let receipt: ethers.TransactionReceipt | null;
    try {
        receipt = await provider.getTransactionReceipt(txHash);
    } catch {
        res.status(402).json({ error: "Failed to fetch transaction receipt from network" });
        return;
    }

    if (!receipt) {
        res.status(402).json({ error: "Payment verification failed: transaction has not been confirmed yet" });
        return;
    }

    if (receipt.status !== 1) {
        res.status(402).json({ error: "Payment verification failed: transaction was reverted on-chain" });
        return;
    }

    await recordPayment(txHash, PAYMENT_ENDPOINT);

    let premiumInsight = "AI Insight unavailable (GEMINI_API_KEY not configured).";
    
    if (ai) {
        try {
            const m = await (vantageMarketContract as any).markets(req.params.marketId);
            const prompt = `Analyze this prediction market:
Question: ${m.description}
Option A Pool: ${ethers.formatEther(m.totalPool0)} INJ
Option B Pool: ${ethers.formatEther(m.totalPool1)} INJ

Give a very brief, single-paragraph realistic insight on the current pool ratios and what it suggests about market sentiment.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });
            if (response.text) {
                premiumInsight = response.text;
            }
        } catch (err) {
            console.error("Gemini API error:", err);
            premiumInsight = "Failed to generate insight via AI.";
        }
    }

    res.json({
        marketId: req.params.marketId,
        premiumInsight,
        generatedAt: new Date().toISOString(),
    });
});
