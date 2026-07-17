export const VANTAGE_MARKET_ADDRESS = "0xd620B56bFbd43e489656A63C9f9cC1A3dC3d3EF6" as `0x${string}`;

export const VANTAGE_MARKET_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" }
    ],
    "name": "placeBet",
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" }
    ],
    "name": "claimPayout",
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
