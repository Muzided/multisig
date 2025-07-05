
import { ObservedDisputeResponse, ObservedEscrowResponse } from "@/types/observer"
import { axiosService } from "../apiConfig"
export const getObserverDisputes = async (page: number = 1, limit: number = 10, status: string = "all") => {
    try {
        const response = await axiosService.get<ObservedDisputeResponse>(`api/observer/observed-disputes?page=${page}&limit=${limit}&status=${status}`)

        return response
    } catch (error) {
        console.log("error while logging in", error)
        throw error;
    }
}

export const getObserverEscrow = async (page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosService.get<ObservedEscrowResponse>(`api/observer/observed-escrows?page=${page}&limit=${limit}`)
        console.log("response", response)
        return response
    } catch (error) {
        console.log("error while fetching user escrows ", error)
        throw error;
    }
}