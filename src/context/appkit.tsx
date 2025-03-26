'use client'

import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, arbitrum, sepolia } from '@reown/appkit/networks'

// 1. Get projectId at https://cloud.reown.com
const projectId = '389afe5ad76ae9f63fb4b84e1212da20'

// 2. Create a metadata object
const metadata = {
  name: 'multiescrowsig',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 3. Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [sepolia],
  projectId,
  features: {
    email:false,
    connectMethodsOrder: ['wallet'],
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

import { ReactNode } from 'react';

export function AppKit({ children }: { children: ReactNode }) {
  return (  
    <>
      {children}
      </>
  )
}