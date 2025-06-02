import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"
import { EscrowCreationData } from "@/types/user"
import { getEscrowDetailsResponse, getLegalDocumentsResponse, getUserEscrowsResponse } from "@/types/escrow"

export const saveEscrow = async (escrowCreationData: EscrowCreationData) => {
    try {
        const response = await axiosService.post<EscrowCreationResponse>('api/escrow/createEscrow', escrowCreationData)

        return response
    } catch (error) {
        console.log("error while logging in", error)
        throw error;
    }
}

export const getUserEscrows = async () => {
    try {
        const response = await axiosService.get<getUserEscrowsResponse>('api/escrow/getAllEscrows')
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

export const saveHistory = async (txType: string, txHash: string, amount: string) => {
    try {
        const response = await axiosService.post<any>(`api/transaction/addTransaction`, {
            transaction_hash: txHash,
            amount: amount,
            transaction_type: txType,
            transaction_date: new Date().toISOString()
        })
        console.log("response", response)
        return response
    } catch (error) {
        console.log("error while fetching payment history", error)
        throw error
    }
}
