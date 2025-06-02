import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"

import { ConversationResponse, startChatRequest } from "@/types/chat"

export const startConversation = async (idOftheUser: string) => {
    try {
        const response = await axiosService.post<ConversationResponse>('api/conversation/start-simple', { otherUserId: idOftheUser })

        return response
    } catch (error) {
        console.log("error while logging in", error)
        throw error;
    }
}
