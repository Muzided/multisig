import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { useWeb3 } from "../context/Web3Context"; // Import your Web3 context
import { MultiSig_Factory_Address, tokenDecimals, Usdt_Contract_Address } from "@/Web3/web3-config";
import { toast } from "react-toastify";
import { createEscrowResponse } from "@/types/escrow";

// Define the Factory Contract Interface
interface UseEscrowFactoryReturn {
    createEscrow: (userAddress: string, receiver: string, amount: string, duration: number, setLoading: Dispatch<SetStateAction<boolean>>) => Promise<void>;
    fetchTotalEscrows: () => Promise<number>;
    fetchTotalPayments(): Promise<string>;
    fetchCreatorEscrows(creatorAddress: string): Promise<string[]>;
    fetchReceiverEscrows(receiverAddress: string): Promise<string[]>;
    fetchPaymentRequest(escrowAddress: string): Promise<{ isError: boolean; isPayoutRequested: boolean; amountRequested: string; completed: boolean; isDisputed: boolean }>;
    requestPayment(escrowAddress: string, setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>, setRefresh: Dispatch<SetStateAction<boolean>>): Promise<void>;
    approvePayment(escrowAddress: string, setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>, setRefresh: Dispatch<SetStateAction<boolean>>): Promise<void>;
    initaiteDispute(escrowAddress: string, disputeReason: string, setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>, setRefresh: Dispatch<SetStateAction<boolean>>): Promise<void>;
    resolveDispute(escrowAddress: string, resolveApproved: boolean, setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>, setRefresh: Dispatch<SetStateAction<boolean>>): Promise<void>;
}

export const useFactory = () => {
    const { multisigFactoryContract, erc20TokenContract ,provider} = useWeb3(); // Get signer & provider from context


    // useEffect(() => {
    //     console.log("multisigFactoryContract", multisigFactoryContract);
    //     fetchTotalEscrows();
    // }, [multisigFactoryContract]);
    //approve USDT
    const approveUSDT = async (usdtContract: Contract, factoryAddress: string, amount: string) => {

        const tx = await usdtContract.approve(factoryAddress, amount);
        await tx.wait(); // Wait for transaction confirmation
        console.log("Approval successful");
    };

    const fetchThreshold = async (): Promise<number> => {
        try {
            if (!multisigFactoryContract) return 0;
            const feeThreshold = await multisigFactoryContract.threshold();
            return Number(feeThreshold);

        } catch (error) {
            console.error("Error fetching total escrows", error);
            return 0;
        }
    }

    const fetchFixedFee = async (): Promise<number> => {
        try {
            if (!multisigFactoryContract) return 0;
            const fixedFee = await multisigFactoryContract.fixedFee();
            return Number(fixedFee);

        } catch (error) {
            console.error("Error fetching total escrows", error);
            return 0;
        }
    }

    const fetchPercentageFee = async (): Promise<number> => {
        try {
            if (!multisigFactoryContract) return 0;
            const feePercentage = await multisigFactoryContract.feeBps();
            return Number(feePercentage);
        } catch (error) {
            console.error("Error fetching total escrows", error);
            return 0;
        }
    }


    const checkUserBalance = async (usdtContract: Contract, userAddress: string) => {
        const balance = await usdtContract.balanceOf(userAddress);
        const formattedBalance = ethers.formatUnits(balance.toString(), tokenDecimals);
        console.log("User Balance:", formattedBalance);
        return formattedBalance;
    }

    const showMetaMaskError = (error: any, id: any) => {
        if (error.code === 4001) {
            toast.update(id, {
                render: "User rejected the request.",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } else if (error.code === -32603) {
            toast.update(id, {
                render: "Internal JSON-RPC error.",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } else {
            toast.update(id, {
                render: `Error: ${error.message || "Unknown error"}`,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    }
    //fetch total escrows
    const fetchTotalEscrows = useCallback(async (): Promise<number> => {
        try {
            if (!multisigFactoryContract) return 0;
            const totalEscrows = await multisigFactoryContract.totalEscrowsCreated();
            return Number(totalEscrows);

        } catch (error) {
            console.error("Error fetching total escrows", error);
            return 0;
        }


    }, [multisigFactoryContract])


    //total payments used in escrows
    const fetchTotalPayments = useCallback(async (): Promise<string> => {
        try {
            if (!multisigFactoryContract) return "0";
            const payment = await multisigFactoryContract.totalPaymentsUsed();

            const paymentUsed = ethers.formatUnits(payment.toString(), tokenDecimals);
            console.log("payment", payment.toString(), paymentUsed);
            return paymentUsed
        } catch (error) {
            console.error("Error fetching total escrows", error);
            return "0";
        }


    }, [multisigFactoryContract])

    //get creator Escrows
    const fetchCreatorEscrows = useCallback(async (creatorAddress: string): Promise<string[]> => {
        try {
            if (!multisigFactoryContract) return [];
            const escrows = await multisigFactoryContract.getCreatorEscrows(creatorAddress);
            return escrows.map((escrow: string) => escrow.toString());
        } catch (error) {
            console.error("Error fetching creator escrows", error);
            return [];
        }
    }, [multisigFactoryContract]);

    //get receiver Escrows
    const fetchReceiverEscrows = useCallback(async (receiverAddress: string): Promise<string[]> => {
        try {
            if (!multisigFactoryContract) return [];
            const escrows = await multisigFactoryContract.getReceiverEscrows(receiverAddress);
            return escrows.map((escrow: string) => escrow.toString());
        } catch (error) {
            console.error("Error fetching receiver escrows", error);
            return [];
        }
    }, [multisigFactoryContract]);

    //get payment request
    const fetchPaymentRequest = useCallback(async (escrowAddress: string): Promise<{ isError: boolean; isPayoutRequested: boolean; amountRequested: string; completed: boolean; isDisputed: boolean }> => {
        try {
            if (!multisigFactoryContract)
                return {
                    isError: true,
                    isPayoutRequested: false,
                    amountRequested: "0",
                    completed: false,
                    isDisputed: false
                };
            const paymentRequest = await multisigFactoryContract.paymentRequests(escrowAddress);
            const escrowDetails = {
                "isError": false,
                "isPayoutRequested": paymentRequest[0] !== "0x0000000000000000000000000000000000000000",
                "amountRequested": ethers.formatUnits(paymentRequest[1].toString(), tokenDecimals),
                "completed": paymentRequest[2],
                "isDisputed": paymentRequest[3],
            }
            return escrowDetails;
        } catch (error) {
            console.error("Error fetching payment request", error);
            return {
                isError: true,
                isPayoutRequested: false,
                amountRequested: "0",
                completed: false,
                isDisputed: false
            };
        }
    }, [])

    //fetch dispute team members
    const fetchDisputeTeamMembers = useCallback(async (): Promise<any> => {
        try {
            if (!multisigFactoryContract) return 0;
            const disputeMembers = await multisigFactoryContract.getDisputeTeamMembers();
            console.log("team memebers fetched", disputeMembers[0])

        } catch (error) {
            console.error("Error fetching total escrows", error);
            return 0;
        }


    }, [multisigFactoryContract])


    //request for escrow release
    const requestPayment = useCallback(async (
        escrowAddress: string,
        setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>,
        setRefresh: Dispatch<SetStateAction<boolean>>
    ) => {
        setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: true }));
        let id: any;
        try {
            if (!multisigFactoryContract) return;

            id = toast.loading(`Requesting Claim...`);

            const tx = await multisigFactoryContract.requestPayment(escrowAddress);
            const receipt = await tx.wait();
            console.log("Receipt:", receipt);

            toast.update(id, {
                render: `Claim Requested`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } catch (error) {
            console.error("Error requesting payment:", error);

            toast.update(id, {
                render: "Failed to request claim",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });

        } finally {
            setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: false }));
            setRefresh(prev => !prev); // Trigger a refresh of the escrow list

        }
    }, [multisigFactoryContract]);

    //refund the funds to the creator
    const releaseFunds = useCallback(async (
        escrowAddress: string,
        setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>,
        setRefresh: Dispatch<SetStateAction<boolean>>
    ) => {
        setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: true }));
        let id: any;
        try {
            if (!multisigFactoryContract) return;

            id = toast.loading(`Releasing Funds...`);

            const tx = await multisigFactoryContract.releaseFunds(escrowAddress);
            const receipt = await tx.wait();
            console.log("Receipt:", receipt);

            toast.update(id, {
                render: `Funds released`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } catch (error) {
            console.error("Error requesting payment:", error);
            toast.update(id, {
                render: "Failed to realease funds",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });

        } finally {
            setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: false }));
            setRefresh(prev => !prev); // Trigger a refresh of the escrow list
        }
    }, [multisigFactoryContract]);

    //aprove funds in the escrow
    const approvePayment = useCallback(async (
        escrowAddress: string,
        setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>,
        setRefresh: Dispatch<SetStateAction<boolean>>
    ) => {
        setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: true }));
        let id: any;
        try {
            if (!multisigFactoryContract) return;

            id = toast.loading(`Approving Funds...`);

            const tx = await multisigFactoryContract.approvePayment(escrowAddress);
            const receipt = await tx.wait();
            console.log("Receipt:", receipt);

            toast.update(id, {
                render: `Funds approved`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } catch (error) {
            console.error("Error requesting payment:", error);
            toast.update(id, {
                render: "Failed to approve funds",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });

        } finally {
            setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: false }));
            setRefresh(prev => !prev); // Trigger a refresh of the escrow list
        }
    }, [multisigFactoryContract]);

    //initaite dispute 
    const initaiteDispute = useCallback(async (
        escrowAddress: string,
        disputeReason: string,
        setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>,
        setRefresh: Dispatch<SetStateAction<boolean>>
    ) => {
        setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: true }));
        let id: any;
        try {
            if (!multisigFactoryContract) return;

            id = toast.loading(`Initiating dispute...`);

            const tx = await multisigFactoryContract.initiateDispute(escrowAddress, disputeReason);
            const receipt = await tx.wait();
            console.log("Receipt:", receipt);

            toast.update(id, {
                render: `Dispute initiated`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } catch (error) {
            console.error("Error requesting payment:", error);
            toast.update(id, {
                render: "Failed to initae dsispute",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });

        } finally {
            setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: false }));
            setRefresh(prev => !prev); // Trigger a refresh of the escrow list
        }
    }, [multisigFactoryContract]);

    //resolved dispute
    const resolveDispute = useCallback(async (
        escrowAddress: string,
        resolveApproved: boolean,
        setLoadingEscrows: Dispatch<SetStateAction<{ [key: string]: boolean }>>,
        setRefresh: Dispatch<SetStateAction<boolean>>
    ) => {
        setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: true }));
        let id: any;
        try {
            if (!multisigFactoryContract) return;

            id = toast.loading(`Resolving dispute...`);

            const tx = await multisigFactoryContract.resolveDispute(escrowAddress, resolveApproved);
            const receipt = await tx.wait();
            console.log("Receipt:", receipt);

            toast.update(id, {
                render: `Dispute resolved`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } catch (error) {
            console.error("Error requesting payment:", error);
            toast.update(id, {
                render: "Failed to resolve dispute",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });

        } finally {
            setLoadingEscrows(prev => ({ ...prev, [escrowAddress]: false }));
            setRefresh(prev => !prev); // Trigger a refresh of the escrow list
        }
    }, [multisigFactoryContract]);

    //  Create Escrow 
    const createMilestoneEscrow = async (
        userAddress: string,
        receiver: string,
        observer: string,
        amount: string[],
        duration: number[],
        setLoading: Dispatch<SetStateAction<boolean>>
    ): Promise<string> => {
        let id: any;
        try {
            setLoading(true)

            if (!multisigFactoryContract || !erc20TokenContract) return '';
            id = toast.loading(`Executing USDT approval...`);

            const parsedAmounts = amount.map(amt => ethers.parseUnits(amt, 6));
            console.log("parsedAmounts", parsedAmounts)
            const totalparsedAmount = parsedAmounts.reduce((sum, amts) => sum + BigInt(amts?.toString()), BigInt(0));
            console.log("totalparsedAmount", totalparsedAmount)
            // Check user balance before proceeding
            const userBalance = await checkUserBalance(erc20TokenContract, userAddress);
            const totalAmount = amount.reduce((sum, amt) => sum + parseFloat(amt), 0);
            if (parseFloat(userBalance) < parseFloat(totalAmount?.toString())) {
                toast.update(id, {
                    render: "Insufficient USDT balance",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                setLoading(false)
                return ''
            }
            await approveUSDT(erc20TokenContract, MultiSig_Factory_Address, totalparsedAmount?.toString());
            toast.update(id, { render: "Creating Escrow", isLoading: true });
            const tx = await multisigFactoryContract.createEscrow(
                receiver,
                totalparsedAmount?.toString(),
                duration[0]?.toString(),
            )

            const receipt = await tx.wait()
            console.log("receipt", receipt)
            toast.update(id, { render: `Escrow Created hash: ${receipt.hash}`, type: "success", isLoading: false, autoClose: 3000 });

            // // Find the escrow address from event logs
            // const event = receipt.events?.find(e => e.event === 'EscrowCreated')
            // const escrowAddress = event?.args?.escrowAddress || ''

            setLoading(false)
            return receipt.hash
        } catch (err: any) {
            setLoading(false)

            toast.update(id, {
                render: "Failed to create escrow",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
            throw err
        }
    }
    const createEscrow = async (
        userAddress: string,
        receiver: string,
        observer: string,
        amount: string[],
        duration: number,
        setLoading: Dispatch<SetStateAction<boolean>>
    ): Promise<createEscrowResponse> => {
        let id: any;
        try {
            setLoading(true)
           
            if (!multisigFactoryContract || !erc20TokenContract)
                return {
                    success: true,
                    escrow_contract_address: '',
                    transaction_hash: '',
                }
            id = toast.loading(`Executing USDT approval...`);
 
           
          
            //fetch fee structure
            const feeThreshold = await fetchThreshold();
            const fixedFee = await fetchFixedFee();
            const feePercentage = await fetchPercentageFee();

            
            //parse amount in wei
            const parsedAmounts = amount.map(amt => ethers.parseUnits(amt, 6));
            

            //sum of all the parsed amounts
            const totalparsedAmount = parsedAmounts.reduce((sum, amts) => sum + BigInt(amts?.toString()), BigInt(0));
        

            // Calculate fee based on threshold
            let feeAmount;
            if (totalparsedAmount <= BigInt(feeThreshold)) {
                // If amount is less than or equal to threshold, use fixed fee
                feeAmount = BigInt(fixedFee);
            } else {
                // If amount exceeds threshold, calculate percentage-based fee
                // Multiply first to avoid precision loss, then divide
                feeAmount = (totalparsedAmount * BigInt(feePercentage)) / BigInt(10000);
            }
           

            // Add fee to total amount
            const totalAmountWithFee = totalparsedAmount + feeAmount;
            

            // Check user balance before proceeding
            const userBalance = await checkUserBalance(erc20TokenContract, userAddress);
            const totalAmount = amount.reduce((sum, amt) => sum + parseFloat(amt), 0);

            if (parseFloat(userBalance) < parseFloat(totalAmount?.toString())) {
                toast.update(id, {
                    render: "Insufficient USDT balance",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                setLoading(false)
                return {
                    success: false,
                    escrow_contract_address: '',
                    transaction_hash: '',
                }
            }
            await approveUSDT(erc20TokenContract, MultiSig_Factory_Address, totalAmountWithFee.toString());
            toast.update(id, { render: "Creating Escrow", isLoading: true });

            const tx = await multisigFactoryContract.createEscrow(
                receiver,
                observer,
                parsedAmounts.map(a => a.toString()), 
                duration.toString()
            )

            const receipt = await tx.wait()
            const escrowContractAddress = await fetchCreatedEsrowAddress(receipt);

             toast.update(id, { render: `Escrow Created hash: ${receipt.hash}`, type: "success", isLoading: false, autoClose: 3000 });

            // // Find the escrow address from event logs
            // const event = receipt.events?.find(e => e.event === 'EscrowCreated')
            // const escrowAddress = event?.args?.escrowAddress || ''

            setLoading(false)
            return {
                success: true,
                escrow_contract_address: escrowContractAddress || '',
                transaction_hash: receipt.hash,
            }
        } catch (err: any) {
            setLoading(false)

            toast.update(id, {
                render: "Failed to create escrow",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
            throw err
        }
    }


    const fetchCreatedEsrowAddress = async (receipt: any): Promise<string | null> => {
        try {

           
            const factoryAbi = [
                "event EscrowCreated(address indexed escrow, address indexed payer, address indexed receiver, uint256 totalAmount, uint256 fee)"
            ];
            const iface = new ethers.Interface(factoryAbi);
            let escrowAddress = null;

            for (const log of receipt?.logs || []) {
                try {
                    const parsed = iface.parseLog(log);
                    if (parsed && parsed.name === "EscrowCreated") {
                        escrowAddress = parsed.args.escrow;
                        console.log("🟢 Escrow contract deployed at:", escrowAddress);
                        break;
                    }
                } catch (err) {
                    // Not the right event, ignore
                    continue;
                }
            }
            
            if (!escrowAddress) {
                console.warn("⚠️ EscrowCreated event not found in transaction logs.");
            }

            return escrowAddress;
        } catch (error) {
            console.error("Error fetching escrow address from logs:", error);
            return null;
        }
    }
    // update dispute team memebers 
    const updateDisputeTeamMembers = useCallback(async (

    ) => {

        let id: any;
        try {
            if (!multisigFactoryContract) return;

            id = toast.loading(`dispute team members...`);
            const arry = [
                "0x9DAb12814E892F89fd398c986D874fd8074A3D56",
                "0x76399c8A5027fD58A1D1b07500ccC8a223BEE0c3",
                "0x4FA703940fb3FDa9af3670213573dDf0a18E6a22"
            ]
            const tx = await multisigFactoryContract.updateDisputeTeamMember("0x76399c8A5027fD58A1D1b07500ccC8a223BEE0c3", true);
            const receipt = await tx.wait();
            console.log("Receipt:", receipt);




            toast.update(id, {
                render: `dispute team members`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } catch (error) {
            console.error("Error requesting payment:", error);
            toast.update(id, {
                render: "Failed to resolve dispute",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });

        } finally {

        }
    }, [multisigFactoryContract]);

    return {
        createEscrow,
        createMilestoneEscrow,
        fetchThreshold,
        fetchFixedFee,
        fetchPercentageFee,
        fetchCreatedEsrowAddress,
        fetchTotalEscrows,
        fetchTotalPayments,
        fetchCreatorEscrows,
        fetchReceiverEscrows,
        fetchPaymentRequest,
        requestPayment,
        releaseFunds,
        approvePayment,
        initaiteDispute,
        resolveDispute,
        fetchDisputeTeamMembers,
        updateDisputeTeamMembers
    };
};
