import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"
import { EscrowCreationData } from "@/types/user"

export const saveEscrow = async (escrowCreationData: EscrowCreationData) => {
    try {
        const response = await axiosService.post<EscrowCreationResponse>('api/escrow/createEscrow', escrowCreationData)
       
        return response
    } catch (error) {
        console.log("error while logging in", error)
        throw error;
    }
}