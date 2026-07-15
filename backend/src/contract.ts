import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const CONTRACT_ADDRESS = "0xD6F18e914D5e81ec7fc01DEC728FF7Aa7C5979b9";
const RPC_URL = "https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/";

const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
if (!relayerPrivateKey) {
    throw new Error("RELAYER_PRIVATE_KEY is not set in the environment");
}

// Human-readable ABI matching the deployed contract on Injective testnet.
// The on-chain contract uses a 7-field Market struct (legacy version).
// Using the JSON artifact ABI (which has 10 fields) causes ethers to hang
// indefinitely on decoding — this inline ABI is the ground truth.
const ABI = [
    // State
    "function nextMarketId() view returns (uint256)",

    // Market struct (7-field, as deployed)
    "function markets(uint256 id) view returns (uint256 id, string description, bool resolved, uint8 winningOutcome, uint256 totalPool0, uint256 totalPool1, uint256 creationTimestamp)",

    // Bets & claims
    "function bets(uint256 marketId, address bettor, uint8 outcome) view returns (uint256)",
    "function claimed(uint256 marketId, address bettor) view returns (bool)",

    // Actions
    "function createMarket(string calldata description) external returns (uint256)",
    "function placeBet(uint256 marketId, uint8 outcome) external payable",
    "function proposeResolution(uint256 marketId, uint8 proposedOutcome) external",
    "function finalizeResolution(uint256 marketId) external",
    "function claimPayout(uint256 marketId) external",

    // Events
    "event MarketCreated(uint256 indexed id, string description, uint256 creationTimestamp)",
    "event BetPlaced(uint256 indexed marketId, address indexed bettor, uint8 outcome, uint256 amount)",
    "event ResolutionProposed(uint256 indexed marketId, uint8 proposedOutcome, uint256 challengeWindowEndTime)",
    "event MarketResolved(uint256 indexed marketId, uint8 winningOutcome)",
    "event PayoutClaimed(uint256 indexed marketId, address indexed bettor, uint256 amount)",
];

export const provider = new ethers.JsonRpcProvider(RPC_URL);
export const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
export const vantageMarketContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    relayerWallet
);