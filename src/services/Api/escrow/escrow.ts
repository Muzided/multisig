import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"
import { EscrowCreationData } from "@/types/user"
import { getEscrowDetailsResponse, getLegalDocumentsResponse, getUserEscrowsResponse, TransactionDetailsResponse } from "@/types/escrow"

export const saveEscrow = async (escrowCreationData: EscrowCreationData) => {
    try {
        const response = await axiosService.post<EscrowCreationResponse>('api/escrow/createEscrow', escrowCreationData)

        return response
    } catch (error) {
        console.log("error while logging in", error)
        throw error;
    }
}

export const getUserEscrows = async (page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosService.get<getUserEscrowsResponse>(`api/escrow/getAllEscrows?page=${page}&limit=${limit}`)
        console.log("response", response)
        return response
    } catch (error) {
        console.log("error while fetching user escrows ", error)
        throw error;
    }
}

export const getLegalDocuments = async (escrowContractAddress: string) => {
    try {
        const response = await axiosService.get<getLegalDocumentsResponse>(
            `api/escrow/getLegalDoc/${escrowContractAddress}`
        );
        return response;
    } catch (error) {
        console.log("error while fetching legal documents", error);
        throw error;
    }
}


export const signLegalDocument = async (escrowContractAddress: string, documentContent: string) => {
    try {
        const response = await axiosService.put(`api/escrow/updateLegalDoc/${escrowContractAddress}`, { document: documentContent })
        return response
    } catch (error) {
        console.log("error while signing legal document", error)
        throw error
    }
}

export const fetchEscrowDetails = async (escrowAddress: string) => {
    try {
        const response = await axiosService.get<getEscrowDetailsResponse>(`api/escrow/getEscrowDetails/${escrowAddress}`)
        return response
    } catch (error) {
        console.log("error while fetching escrow details", error)
        throw error
    }
}

export const saveHistory = async (txType: string, txHash: string, amount: string, escorwContract: string, index: string, receiver_walletaddress: string, type: string) => {
    try {
        const response = await axiosService.post<any>(`api/transaction/addTransaction`, {
            transaction_hash: txHash,
            amount: amount,
            transaction_type: txType,
            transaction_date: new Date().toISOString(),
            escrow_contract_address: escorwContract,
            type: type,
            index: index,
            receiver_wallet_address: receiver_walletaddress,
        })
        console.log("response", response)
        return response
    } catch (error) {
        console.log("error while fetching payment history", error)
        throw error
    }
}

export const fetchTransactionDetails = async (escrowContractAddress: string, index: number, transactionType: string = "payment_released") => {
    try {
        const response = await axiosService.get<TransactionDetailsResponse>(`api/transaction/escrow-transactions?escrowContractAddress=${escrowContractAddress}&index=${index}&transaction_type=${transactionType}`)
        return response
    } catch (error) {
        throw error
    }
}
