'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrowserProvider, Eip1193Provider, ethers } from 'ethers'
import { useAppKitAccount, useAppKitProvider, useDisconnect } from '@reown/appkit/react';
import { useRouter } from 'next/navigation';
interface Web3ContextType {
    provider: BrowserProvider | null;
    signer: ethers.Signer | null;
    account: string;
    isConnected: boolean;
    chainId: number | null;
    disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
    children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
    //rewon-kit
    const { address, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider('eip155');
    const { disconnect } = useDisconnect()

    //next-router
    const router = useRouter();

    //states
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [account, setAccount] = useState<string>('');
    const [chainId, setChainId] = useState<number | null>(null);


    // initilize states when wallet and provider connects
    useEffect(() => {
        // if account address and is-connected not true then dont proceed
        if (!account && !isConnected) return;
        //if wallet provider is avalaible then proceed
        if (walletProvider) init();
    }, [account, isConnected, walletProvider])




    // Function to initialize provider and signer
    const init = async () => {
        try {
            if (!walletProvider) return;

            const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
            const signer = await ethersProvider.getSigner();

            setProvider(ethersProvider);
            setSigner(signer);
            setAccount(await signer.getAddress());

            const { chainId } = await ethersProvider.getNetwork();
            setChainId(Number(chainId));
        } catch (error: any) {
            console.error("Error initializing Web3:", error);
        }
    };

    console.log("after intializations", provider, signer, account, chainId)
    // Handle disconnection: Reset state and redirect to "/"
    // useEffect(() => {
    //     if (!isConnected) {
    //         resetState();
    //         router.push('/');
    //     }
    // }, [isConnected]);

    // Function to reset Web3 state on disconnect
    const resetState = () => {
        setProvider(null);
        setSigner(null);
        setAccount('');
        setChainId(null);
    };

    //dissconnect wallet 
    const disconnectWallet=async()=>{
        await disconnect()
        router.push('/')
    }
    return (
        <Web3Context.Provider value={{
            provider,
            signer,
            account,
            isConnected,
            chainId,
            disconnectWallet
        }}>
            {children}
        </Web3Context.Provider>
    );
}

export function useWeb3(): Web3ContextType {
    const context = useContext(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
}
