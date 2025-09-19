"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { uploadMediatoChat } from "@/services/Api/chat/chat";
import { useSocketChat } from "@/Hooks/useSocketChat";
import ChatHeader from "./chat-header";
import MessageList from "./message-list";
import MessageInput from "./message-input";

import type { Resolver } from "@/types/escrow";
import type { ChatMessage, ChatPagination, ConversationDetailsResponse, Media } from "@/types/chat";
import type { User } from "@/types/user";

export default function ChatView({
  sender,
  user,
  chatDetails,
  chatMessages,
  messagePagination,
  onBack,
  loading,
  onLoadMore,
}: {
  sender: User | null;
  user: Resolver;
  chatDetails: ConversationDetailsResponse | null;
  chatMessages: ChatMessage[];
  messagePagination: ChatPagination;
  onBack: () => void;
  loading: boolean;
  onLoadMore: (conversationId: string, page: number) => Promise<boolean>;
}) {
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<Media | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);

  const senderId = sender?.id || "";
  const conversationId = chatDetails?.conversationId || "";

  const handleMessageReceived = useCallback((msg: ChatMessage) => {
    setAllMessages(prev => {
      if (prev.some(m => m.message_id === msg.message_id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { sendMessage: socketSendMessage, isConnected, markAsRead } = useSocketChat({
    conversationId,
    senderId,
    onMessageReceived: handleMessageReceived,
  });

  const loadMore = async (page: number) => {
    if (messagePagination.page >= messagePagination.totalPages) {
      setIsLoadingMore(false);
      return;
    }
    setIsLoadingMore(true);
    try {
      await onLoadMore(conversationId, page);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (chatMessages.length > 0) setAllMessages(chatMessages);
  }, [chatMessages]);

  // Mark as read when chat opens/updates
  useEffect(() => {
    if (conversationId && senderId) {
      markAsRead(conversationId, senderId);
    }
  }, [conversationId, senderId, markAsRead]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4">
          {/* skeletons */}
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Failed to initialize chat. Please try again.</p>
      </div>
    );
  }

  const onFileChosen = async (file: File) => {
    try {
      const response = await uploadMediatoChat(file);
      if (response.status === 200) {
        setMedia(response.data.media);
        toast.success("File uploaded successfully");
      } else {
        toast.error("Failed to upload file");
      }
    } catch (e) {
      console.error("Error uploading file:", e);
      toast.error("Failed to upload file");
    }
  };

  const onSend = () => {
    if ((!message.trim() && !media) || !conversationId) return;

    if (media && message) {
      socketSendMessage(message, media);
    } else if (media && !message) {
      socketSendMessage("", media);
    } else if (message && !media) {
      socketSendMessage(message, null);
    }
    setMessage("");
    setMedia(null);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <ChatHeader onBack={onBack} user={user} isConnected={isConnected} />

      <MessageList
        messages={allMessages}
        senderId={senderId}
        conversationId={conversationId}
        messagePagination={messagePagination}
        isLoadingMore={isLoadingMore}
        onLoadMore={async (nextPage) => loadMore(nextPage)}
        onNearBottom={() => {
          if (conversationId && senderId) markAsRead(conversationId, senderId);
        }}
      />

      <MessageInput
        message={message}
        setMessage={setMessage}
        media={media}
        setMedia={setMedia}
        onFileChosen={onFileChosen}
        onSend={onSend}
        sendDisabled={!isConnected || (!message.trim() && !media)}
      />
    </div>
  );
}
