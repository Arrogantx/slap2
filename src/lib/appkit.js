import { browser } from '$app/environment'
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { avalancheFuji } from '@reown/appkit/networks'
import { wagmiConfig } from './store'
import { http } from '@wagmi/core';

// Only initialize in browser environment
let modal = undefined;
let wagmiAdapter;

if (browser) {
  const projectId = "4253092f1f3424ac213588667f519e81"
  const networks = [avalancheFuji];

  // Create adapter
  wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
    transports: {
      [avalancheFuji.id]: http()
    }
  })

  // Initialize AppKit
  modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [avalancheFuji],
    defaultNetwork: avalancheFuji,
    projectId,
    features: {
      email: false,
      socials: false
    },
    themeMode: 'light',
      themeVariables: {
          '--w3m-accent': '#dc2626', // Button colour surface-500
          '--w3m-color-mix': '#FFFFFF', // Modal colour mix primary-300
          '--w3m-color-mix-strength': 90, // Strength of colour
          '--w3m-font-size-master': '8px', // Font size
          '--w3m-border-radius-master': '1px' // border rounding
      },
    metadata: {
      name: 'SvelteKit Example',
      description: 'SvelteKit Example using Ethers adapter',
      url: 'https://reown.com/appkit',
      icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
    }
  })

  wagmiConfig.set(wagmiAdapter.wagmiConfig);
}

export { modal, wagmiAdapter }