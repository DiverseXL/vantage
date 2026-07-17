import { JSONFilePreset } from "lowdb/node";
import { join } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";
import { Mutex } from "async-mutex";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../data");
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

interface Bet {
    marketId: number;
    outcome: number;
    amountInj: string;
    timestamp: number;
    txHash: string;
}

interface Claim {
    marketId: number;
    payoutAmountInj: string;
    timestamp: number;
    txHash: string;
}

interface UserRecord {
    bets: Bet[];
    claims: Claim[];
}

interface Payment {
    txHash: string;
    endpoint: string;
    timestamp: number;
}

interface MarketLabels {
    outcome0Label: string;
    outcome1Label: string;
    category?: string | undefined;
    stage?: string | undefined;
    fixtureId?: number | undefined;
}

interface LedgerData {
    users: Record<string, UserRecord>;
    payments: Payment[];
    markets: Record<string, MarketLabels>;
}

const defaultData: LedgerData = { users: {}, payments: [], markets: {} };
const dbPath = join(dataDir, "ledger.json");
const db = await JSONFilePreset<LedgerData>(dbPath, defaultData);
const ledgerMutex = new Mutex();

async function writeLedger(updateFn: (data: LedgerData) => void): Promise<void> {
    return ledgerMutex.runExclusive(async () => {
        await db.read();
        // Initialize fields if migrating from old format
        db.data.users = db.data.users || {};
        db.data.payments = db.data.payments || [];
        db.data.markets = db.data.markets || {};
        updateFn(db.data);
        await db.write();
    });
}

export async function recordBet(
    userId: string,
    marketId: number,
    outcome: number,
    amountInj: string,
    txHash: string
): Promise<void> {
    await writeLedger((data) => {
        if (!data.users[userId]) {
            data.users[userId] = { bets: [], claims: [] };
        }
        data.users[userId]!.bets.push({
            marketId,
            outcome,
            amountInj,
            timestamp: Date.now(),
            txHash,
        });
    });
}

export async function recordClaim(
    userId: string,
    marketId: number,
    payoutAmountInj: string,
    txHash: string
): Promise<void> {
    await writeLedger((data) => {
        if (!data.users[userId]) {
            data.users[userId] = { bets: [], claims: [] };
        }
        data.users[userId]!.claims.push({
            marketId,
            payoutAmountInj,
            timestamp: Date.now(),
            txHash,
        });
    });
}

export function getUserBets(userId: string): Bet[] {
    return db.data.users[userId]?.bets ?? [];
}

export function getUserClaims(userId: string): Claim[] {
    return db.data.users[userId]?.claims ?? [];
}

export async function recordPayment(txHash: string, endpoint: string): Promise<void> {
    await writeLedger((data) => {
        data.payments.push({ txHash, endpoint, timestamp: Date.now() });
    });
}

export function isPaymentUsed(txHash: string): boolean {
    if (!db.data.payments) {
        return false;
    }
    return db.data.payments.some((p) => p.txHash === txHash);
}

// Phase 8.7 — Store custom outcome labels
export async function setMarketLabels(
    marketId: string, 
    outcome0Label: string, 
    outcome1Label: string,
    category?: string,
    stage?: string,
    fixtureId?: number
): Promise<void> {
    await writeLedger((data) => {
        const entry: MarketLabels = { outcome0Label, outcome1Label };
        if (category !== undefined) entry.category = category;
        if (stage !== undefined) entry.stage = stage;
        if (fixtureId !== undefined) entry.fixtureId = fixtureId;
        data.markets[marketId] = entry;
    });
}

export function getMarketLabels(marketId: string): MarketLabels | undefined {
    return db.data.markets?.[marketId];
}

export function getAllMarketLabels(): Record<string, MarketLabels> {
    return db.data.markets || {};
}