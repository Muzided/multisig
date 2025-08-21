import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"
import { createDisputeData, DisputeResolutionResponse, UserDisputeResponse } from "@/types/dispute"

export const openDispute = async (disputeData: createDisputeData) => {
    try {
        const response = await axiosService.post<EscrowCreationResponse>('api/dispute/create', disputeData)

        return response
    } catch (error) {
        console.log("error opening up dispute", error)
        throw error;
    }
}

export const getUserDisputes = async (page: number = 1, limit: number = 10, status: string = "all") => {
    try {
        const response = await axiosService.get<UserDisputeResponse>(`api/dispute/user-disputes?status=${status}&page=${page}&limit=${limit}`)
        return response
    } catch (error) {
        console.log("error while fetching user disputes", error)
        throw error
    }
}

export const getRemaningTimeForActiveDispute = async () => {
    try {
        const response = await axiosService.get

    } catch (error) {
        throw error
    }
}


export const getDisputedResolutionHistory = async (disputeContractAddress: string) => {
    try {
        const response = await axiosService.get<DisputeResolutionResponse>(`api/transaction/getDisputeResolutionTransaction/${disputeContractAddress}`)
        return response
    } catch (error) {
        console.log("error while fetching dispute resolution history", error)
        throw error
    }
}

export const voteOnDispute = async (disputeContractAddress: string, vote: boolean) => {
    try {
        const response = await axiosService.post(`api/dispute/vote/${disputeContractAddress}`, { vote })
        return response
    } catch (error) {
        console.log("error while voting on dispute", error)
        throw error
    }
}