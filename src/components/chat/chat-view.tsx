"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { ChatMessage, ChatPagination, ConversationDetailsResponse, Media } from "@/types/chat"
import { User } from "@/types/user"
import { Resolver } from "@/types/escrow"
import { useSocketChat } from "@/Hooks/useSocketChat"
import { MessageList } from "./message-list"
import { ChatInput } from "./chat-input"
import { formatAddress } from "../../../utils/helper"

export function ChatView({
  sender,
  user,
  chatDetails,
  chatMessages,
  messagePagination,
  onBack,
  loading,
  onLoadMore
}: {
  sender: User | null,
  user: Resolver,
  chatDetails: ConversationDetailsResponse | null,
  chatMessages: ChatMessage[],
  messagePagination: ChatPagination,
  onBack: () => void,
  loading: boolean,
  onLoadMore: (conversationId: string, page: number) => Promise<boolean>
}) {
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  const senderId = sender?.id || ""
  const conversationId = chatDetails?.conversationId || ""

  const handleMessageReceived = useCallback((message: ChatMessage) => {
    setAllMessages(prev => {
      if (prev.some(msg => msg.message_id === message.message_id)) return prev
      return [...prev, message]
    })
  }, [])

  const { sendMessage: socketSendMessage, isConnected } = useSocketChat({
    conversationId,
    senderId,
    onMessageReceived: handleMessageReceived,
  });

  const handleScroll = async (pagination: number) => {
    if (messagePagination.page >= messagePagination.totalPages) return
    await onLoadMore(conversationId, pagination)
  }

  useEffect(() => {
    if (chatMessages.length > 0) setAllMessages(chatMessages)
  }, [chatMessages])

  if (loading) return <p className="p-4">Loading chat...</p>
  if (!conversationId) return <p className="p-4">Failed to initialize chat.</p>

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-gray-500" />
        </div>
        <div>
          <h3 className="font-medium">{formatAddress(user.wallet_address)}</h3>
          <p className="text-sm text-gray-500">Resolver</p>
        </div>
        <div className="ml-auto">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={allMessages}
        senderId={senderId}
        onLoadMore={handleScroll}
        isLoadingMore={false}
        conversationId={conversationId}
        messagePagination={messagePagination}
      />

      {/* Input */}
      <ChatInput
        isConnected={isConnected}
        onSend={(msg, media: Media | null) => socketSendMessage(msg, media)}
      />
    </div>
  )
}
