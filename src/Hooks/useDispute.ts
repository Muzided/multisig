
import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { useWeb3 } from "../context/Web3Context"; // Import your Web3 context
import { MultiSig_Factory_Address, tokenDecimals, Usdt_Contract_Address } from "@/Web3/web3-config";
import { toast } from "react-toastify";
import EscrowAbi from "../Web3/Abis/EscrowAbi.json";
import disputeContractAbi from "../Web3/Abis/disputeContractAbi.json";
import { convertUnixToDate } from "../../utils/helper";
import { useTab } from "@/context/TabContext";

interface UseDsiputeReturn {

    fetchEscrowDetails(escrowAddress: string): Promise<void>;
}

export const useDispute = () => {
    const { signer } = useWeb3();
    const { setActiveTab } = useTab()

    //initialize escrow contract
    const fetchDisputeContract = async (escrowAddress: string) => {
        try {
            const escrowContract = new Contract(escrowAddress, disputeContractAbi, signer);
            return escrowContract;
        } catch (error) {

        }

    }


    // Function to fetch escrow details
    const fetchDisputeDetails = useCallback(async (
        disputeAddress: string,

    ) => {

        try {
            const contract = await fetchDisputeContract(disputeAddress);

            if (!contract) return;

            const reason = await contract.reason();
            const isDisputeResolved = await contract.resolved()
           
            return {
                reason: reason,
                isDisputeResolved: isDisputeResolved

            }




        } catch (error) {
            console.error("Error requesting payment:", error);
        }
    }, [signer]);

    return {
        fetchDisputeDetails
    }
}