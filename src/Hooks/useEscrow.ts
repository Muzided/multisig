import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { useWeb3 } from "../context/Web3Context"; // Import your Web3 context
import { MultiSig_Factory_Address, tokenDecimals, Usdt_Contract_Address } from "@/Web3/web3-config";
import { toast } from "react-toastify";
import EscrowAbi from "../Web3/Abis/EscrowAbi.json";

import { convertUnixToDate } from "../../utils/helper";
import { MileStone, ContractMilestone } from "@/types/contract";

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

    // fetch if escrow is disputed
    const fetchEscrowStatus = async (escrowAddress: string): Promise<string> => {
        try {
            const escorwContract = await fetchEscrowContract(escrowAddress);
            if (!escorwContract) return '';

            const disputeContractAddress = await escorwContract.disputeContract();
            if (disputeContractAddress === "0x0000000000000000000000000000000000000000") return '';

            return disputeContractAddress
        } catch (error) {
            console.error("Error fetching total escrows", error);
            return ''
        }
    }
    const isEscrowFrozen = async (escrowAddress: string): Promise<boolean> => {
        try {
            const escorwContract = await fetchEscrowContract(escrowAddress);
            if (!escorwContract) return false

            const isFrozen = await escorwContract.frozen();


            return isFrozen
        } catch (error) {
            console.error("Error fetching total escrows", error);
            return false
        }
    }
    const getMileStones = async (escrowAddress: string): Promise<ContractMilestone[]> => {
        try {
            const escorwContract = await fetchEscrowContract(escrowAddress);
            if (!escorwContract) return [{
                amount: '',
                dueDate: '',
                released: false,
                disputed: false,
                requested: false,
                requestTime: ''
            }];
            const totalMileStones = await escorwContract.getMileStones();
            console.log("totalMileStones",totalMileStones)
            // Map the array data into milestone objects
            return totalMileStones.map((milestone: any): ContractMilestone => ({
                amount: milestone[0],
                dueDate: milestone[1],
                released: milestone[2],
                disputed: milestone[3],
                requested: milestone[4],
                requestTime: milestone[5]
            }));
        } catch (error) {
            console.error("Error fetching total escrows", error);
            return [{
                amount: '',
                dueDate: '',
                released: false,
                disputed: false,
                requested: false,
                requestTime: ''
            }];
        }
    }

    const dummycall = async (escrowAddress: string): Promise<boolean> => {
        try {
            const escorwContract = await fetchEscrowContract(escrowAddress);
            if (!escorwContract) return false;

            return true
        } catch (error) {
            console.error("Error fetching total escrows", error);
            return false
        }
    }



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
        fetchEscrowDetails,
        getMileStones
    }
}