export interface startChatRequest {
  otherUserId: string;
}

export interface ConversationResponse {
  _id: string;
  participants: string[];
  disputeId: string;
  createdAt: string;
  __v: number;
}

export interface startConversationRequest {
  disputeContractAddress: string;
  target_walletaddress: string;

}
export interface ConversationType {
  userType: string;
  userWalletAddress: string;
  disputeContractAddress: string;
}

export interface Message {
  conversationId: string;
  message: string | null;
  senderId: string;
  media: Media | null
}

export interface UseSocketChatProps {
  conversationId: string;
  senderId: string;
  onMessageReceived?: (message: ChatMessage) => void;
}

export interface UseSocketChatReturn {
  sendMessage: (message: string | null, media: Media | null) => void;
  isConnected: boolean;
  messages: ChatMessage[];
  error: string | null;
}



export interface ConversationDetailsResponse {
  success: boolean;
  conversationId: string;
  userRole: string;
  disputeId: string;
}

export interface ChatSender {
  _id: string;
  wallet_address: string;
}

export interface ChatMessage {
  message_id: string;
  conversationId: string;
  sender: ChatSender;
  media: Media | null
  content: string;
  sentAt: string;
}

export interface ChatPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChatResponse {
  success: boolean;
  messages: ChatMessage[];
  pagination: ChatPagination;
}

export interface startConversationRequest {
  disputeContractAddress: string;
  target_walletaddress: string;
}

export interface ChatDetailsResponse {
  _id: string;
  disputeContractAddress: string;
  participants: {
    _id: string;
    wallet_address: string;
    role: string;
  }[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

// For socket messages
export interface SocketMessage {
  message_id: string;
  conversationId: string;
  senderId: string;
  message: string;
  timestamp: string;
}

// For the chat component props
export interface ChatViewProps {
  sender: {
    id: string;
    wallet_address: string;
  } | null;
  user: {
    wallet_address: string;
    dispute_contract_address: string;
  };
  messages: ChatMessage[];
  onBack: () => void;
  onSendMessage: (message: string) => void;
}


export interface UploadMediaResponse {
  media: Media
}

export interface Media {

  url: string,
  type: string,
  originalName: string

}