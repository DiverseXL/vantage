import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const injectiveTestnet = defineChain({
  id: 1439,
  name: 'Injective EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Injective',
    symbol: 'INJ',
  },
  rpcUrls: {
    default: { http: ['https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://testnet.blockscout.injective.network/' },
  },
});

export const wagmiConfig = createConfig({
  chains: [injectiveTestnet],
  connectors: [injected()],
  transports: {
    [injectiveTestnet.id]: http(),
  },
});
