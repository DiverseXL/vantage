import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import axios from "axios";
import nacl from "tweetnacl";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { vantageMarketContract } from "../contract.js";
import { getAllMarketLabels } from "../ledger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_URL = "https://api.devnet.solana.com";
const API_ORIGIN = "https://txline-dev.txodds.com";
const PROGRAM_ID = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const TXL_MINT = new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG");

const connection = new Connection(RPC_URL, "confirmed");

// Use an absolute path for the wallet to avoid issues running from different dirs
const walletPath = path.join(__dirname, "devnet-wallet.json");
let keypair: Keypair;

if (fs.existsSync(walletPath)) {
  keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8"))));
} else {
  keypair = Keypair.generate();
  fs.writeFileSync(walletPath, JSON.stringify(Array.from(keypair.secretKey)));
  console.log("New devnet wallet created:", keypair.publicKey.toBase58());
}

const wallet = new anchor.Wallet(keypair);

async function ensureFunded() {
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    console.log("Balance too low. Requesting airdrop of 2 SOL...");
    try {
      const airdropSignature = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      });
      console.log("Airdrop successful.");
    } catch (e) {
      console.log("Airdrop failed. Please fund this wallet manually: ", wallet.publicKey.toBase58());
      console.log("Visit: https://faucet.solana.com");
      throw e;
    }
  }
}

const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
anchor.setProvider(provider);

export async function subscribeAndActivate() {
  await ensureFunded();

  const idlPath = path.join(__dirname, "txoracle.json");
  if (!fs.existsSync(idlPath)) {
      throw new Error(`IDL not found at ${idlPath}. Did you download txoracle.json?`);
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8")); // devnet IDL

  // Anchor 0.32.1 constructor: 2 args only. Program ID must live in idl.address.
  // If your downloaded IDL doesn't already have it, uncomment the line below:
  // if (!idl.address) idl.address = PROGRAM_ID.toString();
  const program = new anchor.Program(idl as any, provider);

  const SERVICE_LEVEL_ID = 1;   // Free World Cup tier on devnet
  const DURATION_WEEKS = 4;

  // TODO (unresolved, confirm with TxOdds docs/support before relying on this in production):
  // does an empty array mean "all leagues" or "no leagues subscribed"? If it's the latter,
  // this subscription will succeed on-chain but return zero usable World Cup fixture data,
  // which will look like success and silently fail the actual goal. Get the explicit
  // World Cup 2026 league ID and pass it here once known.
  const SELECTED_LEAGUES: number[] = [];

  console.log("🔄 Subscribing on devnet...");

  // === SUBSCRIBE ===
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    program.programId
  );

  const tokenTreasuryVault = getAssociatedTokenAddressSync(TXL_MINT, tokenTreasuryPda, true, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  const [pricingMatrixPda] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], program.programId);

  console.log("Ensuring user TXL ATA exists...");
  const userAta = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    TXL_MINT,
    wallet.publicKey,
    false,
    "confirmed",
    { commitment: "confirmed" },
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const userTokenAccount = userAta.address;

  console.log("ATA ready, subscribing...");

  const txSig = await (program.methods as any)
    .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
    .accounts({
      user: wallet.publicKey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: TXL_MINT,
      userTokenAccount,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc({ skipPreflight: true }); // consider dropping skipPreflight once this is stable —
                                    // it hides errors until after they've already hit the chain

  console.log("✅ Subscription tx:", txSig);

  // === ACTIVATE ===
  console.log("🔄 Activating API token...");

  const authRes = await axios.post(`${API_ORIGIN}/auth/guest/start`);
  const jwt = authRes.data.token;

  const messageString = `${txSig}::${jwt}`;
  const message = new TextEncoder().encode(messageString);

  const signatureBytes = nacl.sign.detached(message, keypair.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString("base64");

  const activateRes = await axios.post(
    `${API_ORIGIN}/api/token/activate`,
    { txSig, walletSignature, leagues: SELECTED_LEAGUES },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );

  const apiToken = activateRes.data.token || activateRes.data;
  console.log("✅ API Token activated:", apiToken);

  return { apiToken, jwt, txSig };
}

// Test call example
export async function getFixtures(apiToken: string, jwt: string) {
  const res = await axios.get(`${API_ORIGIN}/api/fixtures/snapshot`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "X-Api-Token": apiToken,
    },
  });
  return res.data;
}

export async function runSettlementLoop() {
  console.log("Starting Oracle Settlement Loop...");
  const { apiToken, jwt } = await subscribeAndActivate();

  setInterval(async () => {
    try {
      console.log("Fetching TxLINE snapshot...");
      const fixtures = await getFixtures(apiToken, jwt);

      const nextId: bigint = await (vantageMarketContract as any).nextMarketId();
      const labelsMap = getAllMarketLabels();

      for (let i = 0n; i < nextId; i++) {
        const marketIdStr = i.toString();
        const market = await (vantageMarketContract as any).markets(i);

        if (market.resolved || market.resolutionProposed) {
          continue; // Already resolved or proposed
        }

        const labels = labelsMap[marketIdStr];
        if (!labels || !labels.fixtureId) {
          continue; // Not linked to a TxLINE fixture
        }

        const fixture = fixtures.find((f: any) => f.FixtureId === labels.fixtureId);
        if (!fixture) {
          continue;
        }

        // GameState 4 means Finished
        if (fixture.GameState !== 4) {
          continue;
        }

        // Only resolve when we actually have real score data. A missing score field is
        // NOT a signal to guess an outcome — it means we don't know yet, so we skip this
        // fixture and retry on the next 30s tick rather than fabricating a result.
        // Fabricating an outcome here would directly contradict the site's own transparency
        // copy ("tamper-proof settlement based on official sports data") and would settle
        // real bets against a coin-flip instead of the actual match result.
        if (fixture.Participant1Score === undefined || fixture.Participant2Score === undefined) {
          console.warn(
            `Fixture ${fixture.FixtureId} marked finished but score fields are missing. ` +
            `Skipping market ${marketIdStr} this cycle — will retry once real score data is available.`
          );
          continue;
        }

        console.log(`Fixture ${fixture.FixtureId} finished! Settling market ${marketIdStr}...`);

        // NOTE: this assumes outcome 0 = "Participant1 wins outright" and outcome 1 = anything
        // else (Participant2 wins OR a draw). That mapping only holds if every market backed by
        // this loop is framed as a "Will [named team] win?" Yes/No question (per the decomposed
        // multi-outcome pattern already in use for tournament-outright markets). If any market is
        // instead framed as a straight "Team A vs Team B, pick the winner" with no draw handling,
        // this loop has no correct answer for a drawn match and that market needs a different
        // resolution path (e.g. void/refund) — flag and confirm actual market framing before
        // relying on this in a market that isn't a "will X win" question.
        // Using strict `>` (not `>=`) so a draw correctly falls through to the "not this team" outcome.
        const winningOutcome = fixture.Participant1Score > fixture.Participant2Score ? 0 : 1;

        try {
          // TODO: confirm against the contract ABI whether proposeResolution requires a bond
          // (msg.value) per the propose/dispute design already specced. If it's payable and
          // this call doesn't attach a value, expect this to revert — check before relying on
          // this loop actually settling anything.
          const tx = await (vantageMarketContract as any).proposeResolution(marketIdStr, winningOutcome);
          console.log(`✅ Proposed resolution for market ${marketIdStr} (Outcome: ${winningOutcome}). Tx: ${tx.hash}`);
          await tx.wait();
        } catch (err: any) {
          console.error(`Failed to propose resolution for market ${marketIdStr}:`, err.message);
        }
      }
    } catch (err) {
      console.error("Settlement loop error:", err);
    }
  }, 30000); // Check every 30s
}

// Run it
if (process.argv[1] && (process.argv[1] === __filename || process.argv[1].endsWith("txline.ts"))) {
  runSettlementLoop().catch(console.error);
}