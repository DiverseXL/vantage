import { Router, type Request, type Response, type NextFunction } from "express";
import { generateNonce, SiweMessage } from "siwe";
import jwt from "jsonwebtoken";

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
        
        const { data: fields } = await siweMessage.verify({ signature });

        if (!nonces.has(fields.nonce)) {
            res.status(422).json({ error: "Invalid nonce" });
            return;
        }

        nonces.delete(fields.nonce);

        const token = jwt.sign(
            { address: fields.address },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, address: fields.address });
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
