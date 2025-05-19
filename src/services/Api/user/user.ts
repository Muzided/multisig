import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"
import { EscrowCreationData } from "@/types/user"
import { getEscrowDetailsResponse, getLegalDocumentsResponse, getUserEscrowsResponse, TransactionHistory } from "@/types/escrow"



export const fetchTransactionHistory = async (type: string) => {
    try {
        const response = await axiosService.get<TransactionHistory>(`api/user/transactionHistory?type=/${type}`)
        return response
    } catch (error) {
        console.log("error while fetching escrow details", error)
        throw error
    }
}