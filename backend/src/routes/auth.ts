import { Router, type Request, type Response, type NextFunction } from "express";
import { generateNonce, SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import { verifyMessage } from "viem";

export const authRouter = Router();

// In-memory nonce store
const nonces = new Set<string>();

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error(
            "JWT_SECRET is not set in the environment. Set JWT_SECRET in backend/.env before starting the server."
        );
    }
    return secret;
}

const JWT_SECRET: jwt.Secret = getJwtSecret();

authRouter.get("/auth/nonce", (req: Request, res: Response) => {
    const nonce = generateNonce();
    nonces.add(nonce);
    res.setHeader('Content-Type', 'text/plain');
    res.send(nonce);
});

authRouter.post("/auth/verify", async (req: Request, res: Response) => {
    try {
        const { message, signature } = req.body;
        const siweMessage = new SiweMessage(message);

        // Use viem's verifyMessage to recover and verify the address,
        // avoiding the ethers v6 dependency chain that can trigger
        // "Cannot read properties of undefined (reading 'from')" in
        // siwe's internal siweMessage.verify() -> ethers Signature.from().
        const isValid = await verifyMessage({
            address: siweMessage.address as `0x${string}`,
            message: siweMessage.prepareMessage(),
            signature: signature as `0x${string}`,
        });

        if (!isValid) {
            res.status(401).json({ error: "Invalid signature" });
            return;
        }

        if (!nonces.has(siweMessage.nonce)) {
            res.status(422).json({ error: "Invalid nonce" });
            return;
        }

        nonces.delete(siweMessage.nonce);

        const token = jwt.sign(
            { address: siweMessage.address },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, address: siweMessage.address });
    } catch (e: any) {
        res.status(401).json({ error: "Invalid signature" });
    }
});

// Middleware to protect routes
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }

    const parts = authHeader.split(" ");
    if (parts.length < 2) {
        res.status(401).json({ error: "Malformed authorization header" });
        return;
    }
    const token = parts[1] as string;

    try {
        const payload = jwt.verify(token, JWT_SECRET, undefined) as jwt.JwtPayload;
        (req as any).user = { address: ((payload as any).address ?? '').toLowerCase() };
        next();
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
}
