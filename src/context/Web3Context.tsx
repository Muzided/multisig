'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrowserProvider, Eip1193Provider, ethers } from 'ethers'
import { useAppKitAccount, useAppKitProvider, useDisconnect } from '@reown/appkit/react';
import { useRouter } from 'next/navigation';
//web-3 config
import { escrow_Contract_Address, MultiSig_Factory_Address, Usdt_Contract_Address } from '@/Web3/web3-config';
import MultiSigFactoryAbi from '@/Web3/abis/MultiSigFactoryAbi.json';
import escrowContractAbi from '../Web3/Abis/EscrowAbi.json'

import Erc20TokenAbi from '@/Web3/abis/Erc20TokenAbi.json';
interface Web3ContextType {
    provider: BrowserProvider | null;
    signer: ethers.Signer | null;
    account: string;
    isConnected: boolean;
    chainId: number | null;
    multisigFactoryContract: ethers.Contract | null;
    erc20TokenContract: ethers.Contract | null;
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
    const [multisigFactoryContract, setMultisigFactoryContract] = useState<ethers.Contract | null>(null);
    const [escrowContract, setEscrowContract] = useState<ethers.Contract | null>(null);
    const [erc20TokenContract, setErc20TokenContract] = useState<ethers.Contract | null>(null);



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
            const factoryContract = new ethers.Contract(MultiSig_Factory_Address, MultiSigFactoryAbi, signer);
            const erc20TokenContract = new ethers.Contract(Usdt_Contract_Address, Erc20TokenAbi,signer);
            const escrowContract = new ethers.Contract(escrow_Contract_Address, escrowContractAbi, signer);
console.log("escrow contract", escrowContract)

            setProvider(ethersProvider);
            setSigner(signer);
            setAccount(await signer.getAddress());
            setMultisigFactoryContract(factoryContract);
            setErc20TokenContract(erc20TokenContract);

            const { chainId } = await ethersProvider.getNetwork();
            setChainId(Number(chainId));
        } catch (error: any) {
            console.error("Error initializing Web3:", error);
        }
    };

    console.log("after intializations", provider, signer, account, chainId,multisigFactoryContract)
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
    const disconnectWallet = async () => {
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
            multisigFactoryContract,
            erc20TokenContract,
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
