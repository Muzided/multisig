export interface startChatRequest   {
    otherUserId: string;
}

export interface ConversationResponse {
    _id: string;
    participants: string[];
    createdAt: string;
    __v: number;
}

