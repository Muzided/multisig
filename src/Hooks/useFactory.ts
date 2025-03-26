import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context"; // Import your Web3 context
import { tokenDecimals } from "@/Web3/web3-config";

// Define the Factory Contract Interface
interface UseEscrowFactoryReturn {
    createEscrow: (receiver: string, amount: string, duration: number, setLoading: Dispatch<SetStateAction<boolean>>) => Promise<void>;
    fetchTotalEscrows:() => Promise<number>;
    fetchTotalPayments(): Promise<string>;
    // requestPayment: (escrowAddress: string) => Promise<void>;
    // approvePayment: (escrowAddress: string) => Promise<void>;
    // releaseFunds: (escrowAddress: string) => Promise<void>;
    // initiateDispute: (escrowAddress: string) => Promise<void>;
    // resolveDispute: (escrowAddress: string, approve: boolean) => Promise<void>;
}

export const useFactory = () => {
    const { signer, provider, multisigFactoryContract } = useWeb3(); // Get signer & provider from context
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalEscrows, setTotalEscrows] = useState<number>(0);

    // useEffect(() => {
    //     console.log("multisigFactoryContract", multisigFactoryContract);
    //     fetchTotalEscrows();
    // }, [multisigFactoryContract]);

    //fetch total escrows
    const fetchTotalEscrows = useCallback(async ():Promise<number> => {
        try {
            if (!multisigFactoryContract) return 0;
        const totalEscrows = await multisigFactoryContract.totalEscrowsCreated();
        return Number(totalEscrows);
        console.log("totalEscrows", totalEscrows);
        } catch (error) {
            console.error("Error fetching total escrows", error);
            return 0;
        }
        

    }, [multisigFactoryContract])
   

    //total payments used in escrows
    const fetchTotalPayments = useCallback(async ():Promise<string> => {
        try {
            if (!multisigFactoryContract) return "0";
        const payment = await multisigFactoryContract.totalPaymentsUsed();
        
        const paymentUsed = ethers.formatUnits(payment.toString(), tokenDecimals);
        console.log("payment", payment.toString(),paymentUsed);
        return paymentUsed
        } catch (error) {
            console.error("Error fetching total escrows", error);
            return "0";
        }
        

    }, [multisigFactoryContract])


    // Utility function for contract calls
    const callContractFunction = useCallback(async (func: () => Promise<void>, setLoading: Dispatch<SetStateAction<boolean>>) => {
        setLoading(true);
        setError(null);
        try {
            await func();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Transaction failed");
        } finally {
            setLoading(false);
        }
    }, []);


    // const createEscrow = useCallback(
    //     async (receiver: string, amount: string, duration: number, setLoading: Dispatch<SetStateAction<boolean>>) => {
    //         if (!factoryContract) return;
    //         const parsedAmount = ethers.parseUnits(amount, 6); // Assuming USDT (6 decimals)
    //         await callContractFunction(() => factoryContract.createEscrow(receiver, parsedAmount?.toString(), duration), setLoading);
    //     },
    //     [factoryContract, callContractFunction]
    // );


    //  Create Escrow 
    const createEscrow = useCallback(async (
        receiver: string,
        amount: string,
        duration: number,
        setLoading: Dispatch<SetStateAction<boolean>>
    ): Promise<string> => {
        try {
            setLoading(true)
            setError(null)
            if (!multisigFactoryContract) return '';
            const parsedAmount = ethers.parseUnits(amount, 6);
            const tx = await multisigFactoryContract.createEscrow(
                receiver,
                parsedAmount?.toString(),
                duration
            )

            const receipt = await tx.wait()
            console.log("receipt", receipt)

            // // Find the escrow address from event logs
            // const event = receipt.events?.find(e => e.event === 'EscrowCreated')
            // const escrowAddress = event?.args?.escrowAddress || ''

            setLoading(false)
            return receipt
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
            throw err
        }
    }, [multisigFactoryContract])
    // // ✅ Request Payment
    // const requestPayment = useCallback(
    //     async (escrowAddress: string) => {
    //         if (!factoryContract) return;
    //         await callContractFunction(() => factoryContract.requestPayment(escrowAddress));
    //     },
    //     [factoryContract, callContractFunction]
    // );

    // // ✅ Approve Payment
    // const approvePayment = useCallback(
    //     async (escrowAddress: string) => {
    //         if (!factoryContract) return;
    //         await callContractFunction(() => factoryContract.approvePayment(escrowAddress));
    //     },
    //     [factoryContract, callContractFunction]
    // );

    // // ✅ Release Funds
    // const releaseFunds = useCallback(
    //     async (escrowAddress: string) => {
    //         if (!factoryContract) return;
    //         await callContractFunction(() => factoryContract.releaseFunds(escrowAddress));
    //     },
    //     [factoryContract, callContractFunction]
    // );

    // // ✅ Initiate Dispute
    // const initiateDispute = useCallback(
    //     async (escrowAddress: string) => {
    //         if (!factoryContract) return;
    //         await callContractFunction(() => factoryContract.initiateDispute(escrowAddress));
    //     },
    //     [factoryContract, callContractFunction]
    // );

    // // ✅ Resolve Dispute
    // const resolveDispute = useCallback(
    //     async (escrowAddress: string, approve: boolean) => {
    //         if (!factoryContract) return;
    //         await callContractFunction(() => factoryContract.resolveDispute(escrowAddress, approve));
    //     },
    //     [factoryContract, callContractFunction]
    // );

    return {
        createEscrow,
        fetchTotalEscrows,
        fetchTotalPayments
    };
};
