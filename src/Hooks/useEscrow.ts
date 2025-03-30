
import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { useWeb3 } from "../context/Web3Context"; // Import your Web3 context
import { MultiSig_Factory_Address, tokenDecimals, Usdt_Contract_Address } from "@/Web3/web3-config";
import { toast } from "react-toastify";
import EscrowAbi from "../Web3/Abis/EscrowAbi.json";

import { convertUnixToDate } from "../../utils/helper";
import { Imperial_Script } from "next/font/google";

interface UseEscrowReturn {

    fetchEscrowDetails(escrowAddress: string): Promise<void>;
}

export const useEscrow = () => {
    const { signer } = useWeb3();

    //initialize escrow contract
    const fetchEscrowContract = async (escrowAddress: string) => {
        try {
            const escrowContract = new Contract(escrowAddress, EscrowAbi, signer);
            return escrowContract;
        } catch (error) {

        }

    }

    // Function to convert Unix timestamp to date string
    // const convertUnixToDate = (unixTimestamp: number): string => {
    //     return new Date(unixTimestamp * 1000).toISOString(); // Works on iOS & Safari
    // }

    // Function to fetch escrow details
    const fetchEscrowDetails = useCallback(async (
        escrowAddress: string,

    ) => {

        try {
            const contract = await fetchEscrowContract(escrowAddress);

            if (!contract) return;
            const amount = await contract.amount();
            const deadline = await contract.deadline();
            const disputeContract = await contract.disputeContract()
            const isEscrowDisputed = disputeContract !== "0x0000000000000000000000000000000000000000"
            const escrowAmount = ethers.formatUnits(amount, tokenDecimals);
            console.log("Escrow details:", escrowAmount, convertUnixToDate(Number(deadline)), disputeContract);
            return {
                escrowAmount: escrowAmount,
                deadline: convertUnixToDate(Number(deadline)),
                isEscrowDisputed: isEscrowDisputed,
                disputeContract: disputeContract
            }



        } catch (error) {
            console.error("Error requesting payment:", error);
        }
    }, [signer]);

    return {
        fetchEscrowDetails
    }
}