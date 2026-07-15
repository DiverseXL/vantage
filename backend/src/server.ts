import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { marketsRouter } from "./routes/markets.js";
import { betsRouter } from "./routes/bets.js";
import { premiumRouter } from "./routes/premium.js";
import { authRouter } from "./routes/auth.js";
import { fixturesRouter } from "./routes/fixtures.js";
import { provider } from "./contract.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Phase 8.5 — Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

app.use("/api", apiLimiter);
app.use("/api", marketsRouter);
app.use("/api", betsRouter);
app.use("/api", premiumRouter);
app.use("/api", authRouter);
app.use("/api", fixturesRouter);

// Phase 8.4 — Transaction status endpoint
app.get("/api/tx/:hash/status", async (req, res) => {
    try {
        const hash = req.params.hash;
        const receipt = await provider.getTransactionReceipt(hash);
        if (!receipt) {
            res.json({ status: "pending" });
            return;
        }
        res.json({ status: receipt.status === 1 ? "confirmed" : "failed" });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(port, () => {
    console.log(`Vantage backend listening on port ${port}`);
});