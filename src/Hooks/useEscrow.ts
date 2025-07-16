import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { useWeb3 } from "../context/Web3Context"; // Import your Web3 context
import { MultiSig_Factory_Address, tokenDecimals, Usdt_Contract_Address } from "@/Web3/web3-config";
import { toast } from "react-toastify";
import EscrowAbi from "../Web3/Abis/EscrowAbi.json";
import { useEscrowRefresh } from "../context/EscrowContext";

import { convertUnixToDate } from "../../utils/helper";
import { MileStone, ContractMilestone, RequestPaymentResponse } from "@/types/contract";
import { saveHistory } from "@/services/Api/escrow/escrow";
import { openDispute } from "@/services/Api/dispute/dispute";
import { createDisputeData } from "@/types/dispute";
import { useTab } from "@/context/TabContext";

interface UseEscrowReturn {

    fetchEscrowDetails(escrowAddress: string): Promise<void>;
}

export const useEscrow = () => {
    const { signer } = useWeb3();
    const { triggerRefresh } = useEscrowRefresh();
    const { setActiveTab } = useTab()

    //initialize escrow contract
    const fetchEscrowContract = async (escrowAddress: string) => {
        try {
            if (!signer) return null
            console.log("escrow-address", signer)
            const escrowContract = new Contract(escrowAddress, EscrowAbi, signer);
            return escrowContract;
        } catch (error) {
            console.error("Error creating  escrow contract", error);
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


            console.log("escrowAddress-add", escrowAddress);
            const escorwContract = await fetchEscrowContract(escrowAddress);
            console.log("escorwContract", escorwContract);
            if (!escorwContract) return [{
                id: '',
                amount: '',
                dueDate: '',
                released: false,
                rejected: false,
                disputedRaised: false,
                requested: false,
                requestTime: ''
            }];
            const totalMileStones = await escorwContract.getMilestones();
            //  console.log("totalMileStones",totalMileStones)
            // Map the array data into milestone objects
            return totalMileStones.map((milestone: any): ContractMilestone => ({
                id: milestone[0]?.toString(),
                amount: ethers.formatUnits(milestone[1]?.toString(), tokenDecimals),
                dueDate: milestone[2],
                released: milestone[3],
                rejected: milestone[4],
                disputedRaised: milestone[5],
                requested: milestone[6],
                requestTime: milestone[7]?.toString()
            }));
        } catch (error) {
            console.error("Error fetching getting milestones ", error);
            return [{
                id: '',
                amount: '',
                dueDate: '',
                released: false,
                rejected: false,
                disputedRaised: false,
                requested: false,
                requestTime: ''
            }];
        }
    }

    const requestPayment = async (escrowAddress: string, escrowIndex: string, amount: string, receiver_wallet_address: string, escrowType: string): Promise<RequestPaymentResponse> => {
        let id: any;
        try {
            id = toast.loading(`Requesting payment...`);
            const escorwContract = await fetchEscrowContract(escrowAddress);
            if (!escorwContract) {
                toast.update(id, {
                    render: "Error while initializing escrow contract",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                return {
                    transactionHash: "",
                    isSuccess: false,
                    message: "Error while initializing escrow contract"
                };
            }
            const requestPayment = await escorwContract.requestMilestone(escrowIndex);
            const tx = await requestPayment.wait();
            const res = await saveHistory("payment_request", tx.hash, amount, escrowAddress, escrowIndex, receiver_wallet_address, escrowType)
            if (res.status === 201) {
                toast.update(id, { render: `Requested payment hash: ${tx.hash}`, type: "success", isLoading: false, autoClose: 3000 });
                triggerRefresh();
                return {
                    transactionHash: tx.hash,
                    isSuccess: true,
                    message: "Successfully requested payment"
                };
            } else {
                triggerRefresh();
                return {
                    transactionHash: tx.hash,
                    isSuccess: true,
                    message: "Successfully requested payment"
                };
            }
        } catch (error: any) {

            const errorString = error.toString().toLowerCase();
            console.error("Error requesting payment", errorString);
            if (errorString.includes("past due date")) {
                toast.update(id, { render: "Can't request payment for past due date.", type: "error", isLoading: false, autoClose: 3000 });
            } else if (errorString.includes("milestone not started")) {
                toast.update(id, { render: "Cannot proceed with payment request — milestone not yet started.", type: "error", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(id, { render: "Error while requesting payment", type: "error", isLoading: false, autoClose: 3000 });
            }
            return {
                transactionHash: "",
                isSuccess: false,
                message: errorString
            };
        }
    }


    const releasePayment = async (escrowAddress: string, escrowIndex: string, amount: string, nextMilestoneDueDate: string, receiver_wallet_address: string, escrowType: string): Promise<RequestPaymentResponse> => {
        let id: any;
        try {
            id = toast.loading(`Releasing payment...`);
            const escorwContract = await fetchEscrowContract(escrowAddress);

            if (!escorwContract) {
                toast.update(id, {
                    render: "Error while initializing escrow contract",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                return {
                    transactionHash: "",
                    isSuccess: false,
                    message: "Error while initializing escrow contract"
                };
            }

            //request payment from blockchain
            const requestPayment = await escorwContract.approveRequest(escrowIndex, nextMilestoneDueDate);
            const tx = await requestPayment.wait();
            const res = await saveHistory("payment_released", tx.hash, amount, escrowAddress, escrowIndex, receiver_wallet_address, escrowType)
            if (res.status === 201) {
                toast.update(id, { render: `Released payment hash: ${tx.hash}`, type: "success", isLoading: false, autoClose: 3000 });
                triggerRefresh();
                return {
                    transactionHash: tx.hash,
                    isSuccess: true,
                    message: "Successfully released payment"
                };
            } else {

                triggerRefresh();
                return {
                    transactionHash: tx.hash,
                    isSuccess: true,
                    message: "Successfully released payment"
                };
            }

        } catch (error: any) {

            const errorString = error.toString().toLowerCase();
            console.error("Error requesting payment", errorString);
            if (errorString.includes("past due date")) {
                toast.update(id, { render: "Can't request payment for past due date.", type: "error", isLoading: false, autoClose: 3000 });
            } else if (errorString.includes("milestone not started")) {
                toast.update(id, { render: "Cannot proceed with payment request — milestone not yet started.", type: "error", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(id, { render: "Error while requesting payment", type: "error", isLoading: false, autoClose: 3000 });
            }
            return {
                transactionHash: "",
                isSuccess: false,
                message: errorString
            };
        }
    }

    const claimUnRequestedAmounts = async (escrowAddress: string, escrowIndex: string): Promise<RequestPaymentResponse> => {
        let id: any;
        try {
            id = toast.loading(`claiming amount...`);
            const escorwContract = await fetchEscrowContract(escrowAddress);
            if (!escorwContract) {
                toast.update(id, {
                    render: "Error while initializing escrow contract",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                return {
                    transactionHash: "",
                    isSuccess: false,
                    message: "Error while initializing escrow contract"
                };
            }

            //request payment from blockchain
            const requestPayment = await escorwContract.reclaimUnrequested(escrowIndex);
            const tx = await requestPayment.wait();

            toast.update(id, { render: `claimed amount hash: ${tx.hash}`, type: "success", isLoading: false, autoClose: 3000 });
            triggerRefresh();
            return {
                transactionHash: tx.hash,
                isSuccess: true,
                message: "Successfully claimed amount"
            };

        } catch (error: any) {

            const errorString = error.toString().toLowerCase();
            console.error("Error requesting payment", errorString);
            if (errorString.includes("past due date")) {
                toast.update(id, { render: "Can't request payment for past due date.", type: "error", isLoading: false, autoClose: 3000 });
            } else if (errorString.includes("milestone not started")) {
                toast.update(id, { render: "Cannot proceed with payment request — milestone not yet started.", type: "error", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(id, { render: "Error while requesting payment", type: "error", isLoading: false, autoClose: 3000 });
            }
            return {
                transactionHash: "",
                isSuccess: false,
                message: errorString
            };
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


    const raiseDispute = async (escrowAddress: string, escrowIndex: string, reason: string, type: string): Promise<RequestPaymentResponse> => {
        let id: any;
        try {
            id = toast.loading(`initiating dispute...`);
            const escorwContract = await fetchEscrowContract(escrowAddress);
            if (!escorwContract) {
                toast.update(id, {
                    render: "Error while initializing escrow contract",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                return {
                    transactionHash: "",
                    isSuccess: false,
                    message: "Error while initializing escrow contract"
                };
            }

            //request payment from blockchain
            const disputeRes = await escorwContract.raiseDispute(escrowIndex, reason);
            const tx = await disputeRes.wait();
            console.log("tx", tx, tx.logs, tx.logs[0], tx.logs[0].address);

            const disputeContractAddress = tx.logs[0].address
            console.log("disputeContractAddress", disputeContractAddress)
            const disputeData: createDisputeData = {
                escrowContractAddress: escrowAddress,
                type: type,
                disputeContractAddress: disputeContractAddress,
                milestoneIndex: Number(escrowIndex),
                transaction_hash: tx.hash
            }
            const res = await openDispute(disputeData)
            if (res.status === 201) {
                toast.update(id, { render: `initiated dispute hash: ${tx.hash}`, type: "success", isLoading: false, autoClose: 3000 });
                triggerRefresh();
                setActiveTab("dispute")
                return {
                    transactionHash: tx.hash,
                    isSuccess: true,
                    message: "Successfully initiated dispute"
                };
            } else {
                return {
                    transactionHash: "",
                    isSuccess: false,
                    message: "Error while disputing the contract"
                };
            }
        } catch (error: any) {

            const errorString = error.toString().toLowerCase();
            console.error("Error initiating dispute", errorString);
            if (errorString.includes("too early to dispute")) {
                toast.update(id, { render: "too early to dispute.", type: "error", isLoading: false, autoClose: 3000 });
            } else if (errorString.includes("milestone not started")) {
                toast.update(id, { render: "Cannot proceed with payment request — milestone not yet started.", type: "error", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(id, { render: "Error while raising dispute", type: "error", isLoading: false, autoClose: 3000 });
            }
            return {
                transactionHash: "",
                isSuccess: false,
                message: errorString
            };
        }
    }

    return {
        fetchEscrowDetails,
        getMileStones,
        requestPayment,
        releasePayment,
        claimUnRequestedAmounts,
        raiseDispute
    }
}