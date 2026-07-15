export const VANTAGE_MARKET_ADDRESS = "0xD6F18e914D5e81ec7fc01DEC728FF7Aa7C5979b9" as `0x${string}`;

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
