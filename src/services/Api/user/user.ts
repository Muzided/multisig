import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"
import { EscrowCreationData } from "@/types/user"
import { getEscrowDetailsResponse, getLegalDocumentsResponse, getUserEscrowsResponse, TransactionHistory } from "@/types/escrow"



export const fetchTransactionHistory = async (type: string, page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosService.get<TransactionHistory>(`api/user/transactionHistory?type=${type}&page=${page}&limit=${limit}`)
        return response
    } catch (error) {
        console.log("error while fetching escrow details", error)
        throw error
    }
}

export const getUserStats=async()=>{
    try {
        const response = await axiosService.get<TransactionHistory>(`api/user/stats`)
        return response 
    } catch (error) {
        console.log("getting error while fetchig user stats",error)
        throw error
        }
}