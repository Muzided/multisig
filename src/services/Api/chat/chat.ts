import { EscrowCreationResponse } from "@/types/contract"
import { axiosService } from "../apiConfig"

import { ChatDetailsResponse, ChatResponse, ConversationDetailsResponse, ConversationResponse, startChatRequest, startConversationRequest, UploadMediaResponse } from "@/types/chat"
import { ConversationMessagesResponse } from "../conversation/converstaion"

export const startConversation = async (requestData: startConversationRequest) => {
    try {
        const response = await axiosService.post<ConversationResponse>('api/conversation/start', requestData)

        return response
    } catch (error) {
        console.log("error while starting conversation", error)
        throw error;
    }
}

export const getConversation = async (conversationId: string) => {
    try {
        const response = await axiosService.get<ConversationResponse>(`api/getChat/${conversationId}`)
        return response
    } catch (error) {
        console.log("error while getting conversation", error)
        throw error;
    }
}

export const getConversationDetails = async (disputeWalletAddress: string) => {
    try {
        const response = await axiosService.get<ConversationDetailsResponse>(`api/conversation/details/${disputeWalletAddress}`)
        return response
    } catch (error) {
        console.log("error while fetching conversation details", error)
        throw error;
    }
}

export const getChatMessages = async (conversationId: string, page: number = 1, limit: number = 15) => {
    try {
        const response = await axiosService.get<ChatResponse>(`api/conversation/getChat/${conversationId}?page=${page}&limit=${limit}`)
        return response
    } catch (error) {
        console.log("error while fetching conversation messages", error)
        throw error;
    }
}

export const uploadMediatoChat = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosService.post<UploadMediaResponse>(`api/chat/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response;
    } catch (error) {
        console.log("error while uploading media", error);
        throw error;
    }
}

export const getConversationMedia = async (conversationId: string) => {
    try {
        const response = await axiosService.get<ConversationMessagesResponse>(`api/conversation/getMedia/${conversationId}`)
        return response
    } catch (error) {
        console.log("error while getting conversation", error)
        throw error;
    }
}