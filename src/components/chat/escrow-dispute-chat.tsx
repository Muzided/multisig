"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useUser } from "@/context/userContext";
import { getConversationDetails, getChatMessages, startConversation } from "@/services/Api/chat/chat";
import type { getEscrowDetailsResponse, Resolver } from "@/types/escrow";
import type { ChatMessage, ChatPagination, ConversationDetailsResponse, startConversationRequest } from "@/types/chat";

import UserList from "./user-list";
import ChatView from "./chat-view";

export default function EscrowDisputeChat({ escrowDetails }: { escrowDetails: getEscrowDetailsResponse }) {
  const [selectedUser, setSelectedUser] = useState<Resolver | null>(null);
  const [chatDetails, setChatDetails] = useState<ConversationDetailsResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagePagination, setMessagePagination] = useState<ChatPagination>({
    total: 0,
    page: 1,
    limit: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const handleSelectUser = async (resolver: Resolver) => {
    setSelectedUser(resolver);
    initializeConversation();
  };

  const initializeConversation = async () => {
    const disputeAddress = escrowDetails?.resolver?.dispute_contract_address;
    if (!disputeAddress) return;

    try {
      setLoading(true);

      // 1) Try to get conversation by dispute contract
      const resp = await getConversationDetails(disputeAddress);
      if (resp.status === 200 && resp.data?.conversationId) {
        setChatDetails(resp.data);

        // 2) Fetch messages for that conversation
        const messagesResponse = await getChatMessages(resp.data.conversationId);
        if (messagesResponse.status === 200 && messagesResponse.data) {
          setMessages(messagesResponse.data.messages);
          setMessagePagination(messagesResponse.data.pagination);
        }
      } else {
        // 3) Start a new conversation if none
        const payload: startConversationRequest = {
          disputeContractAddress: disputeAddress,
          target_walletaddress: escrowDetails.resolver.wallet_address,
        };
        const newConvo = await startConversation(payload);

        if (newConvo.status === 201 || newConvo.status === 200) {
          setChatDetails({
            conversationId: newConvo.data._id,
            disputeId: "",
            success: true,
            userRole: "",
          });
          setMessages([]);
          setMessagePagination({
            total: 0,
            page: 1,
            limit: 0,
            totalPages: 0,
          });
        }
      }
    } catch (err) {
      console.error("error while handling conversation:", err);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escrowDetails?.resolver?.dispute_contract_address, escrowDetails?.resolver?.wallet_address]);

  const handleLoadMoreMessages = async (conversationId: string, page: number) => {
    try {
      const response = await getChatMessages(conversationId, page);
      if (response.status === 200 && response.data) {
        // update pagination
        setMessagePagination({
          ...response.data.pagination,
          page,
        });

        // merge without duplicates
        const existing = new Map(messages.map(m => [m.message_id, m]));
        response.data.messages.forEach(m => {
          if (!existing.has(m.message_id)) existing.set(m.message_id, m);
        });

        const merged = Array.from(existing.values()).sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        setMessages(merged);
        return response.data.messages.length > 0;
      }
      return false;
    } catch (err) {
      console.error("Error loading more messages:", err);
      toast.error("Failed to load more messages");
      return false;
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
    setMessagePagination({ total: 0, page: 0, limit: 0, totalPages: 0 });
    setLoading(true);
  };

  console.log("escrow-details",escrowDetails.resolver)
  if (!selectedUser) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select a user to start chatting</h2>
        <UserList user={escrowDetails.resolver} onSelectUser={handleSelectUser} />
      </div>
    );
  }

  return (
 
    <ChatView
      sender={user}
      user={selectedUser}
      chatDetails={chatDetails}
      chatMessages={messages}
      messagePagination={messagePagination}
      onBack={handleBack}
      loading={loading}
      onLoadMore={handleLoadMoreMessages}
    />
  );
}
