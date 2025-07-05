// TypeScript interfaces for conversation messages API response
export interface ConversationSender {
  _id: string;
  wallet_address: string;
}

export interface ConversationMedia {
  type: string; // 'image' | 'file' | ...
  url: string;
  originalName: string;
}

export interface ConversationMessage {
  message_id: string;
  conversationId: string;
  sender: ConversationSender;
  media: ConversationMedia;
  sentAt: string;
}

export interface ConversationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConversationMessagesResponse {
  success: boolean;
  messages: ConversationMessage[];
  pagination: ConversationPagination;
}

