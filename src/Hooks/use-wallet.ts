// hooks/use-wallet.ts
import { useState, useEffect } from 'react'

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<boolean | null>(null)
  
  const connectWallet = async () => {
    
        
        setAccount("0xsd34j5nwj45bx787sd7x7sd6")
        setProvider(true)
        return true
      
   
  }
  
  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
  }
  
  return { account, provider, connectWallet, disconnectWallet }
}