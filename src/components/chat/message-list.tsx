"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, ChatPagination } from "@/types/chat";
import { Paperclip } from "lucide-react";

export default function MessageList({
  messages,
  senderId,
  onLoadMore,
  isLoadingMore,
  conversationId,
  messagePagination,
  onNearBottom,
}: {
  messages: ChatMessage[];
  senderId: string;
  onLoadMore: (pagination: number) => Promise<void>;
  messagePagination: ChatPagination;
  isLoadingMore: boolean;
  conversationId: string;
  onNearBottom?: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
    [messages]
  );

  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sortedMessages, shouldScrollToBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (container && prevScrollHeight > 0) {
      const newHeight = container.scrollHeight;
      const diff = newHeight - prevScrollHeight;
      container.scrollTop = container.scrollTop + diff;
      setPrevScrollHeight(0);
    }
  }, [sortedMessages, prevScrollHeight]);

  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || isLoadingMore || messagePagination.page === messagePagination.totalPages) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isNearBottom);

    if (isNearBottom) {
      onNearBottom?.();
    }

    if (scrollTop < 100) {
      try {
        setPrevScrollHeight(scrollHeight);
        await onLoadMore(messagePagination.page + 1);
      } catch {
        setPrevScrollHeight(0);
      }
    }
  }, [conversationId, isLoadingMore, onLoadMore, messagePagination]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let tid: NodeJS.Timeout;
    const throttled = () => {
      clearTimeout(tid);
      tid = setTimeout(handleScroll, 100);
    };

    container.addEventListener("scroll", throttled);
    return () => {
      container.removeEventListener("scroll", throttled);
      clearTimeout(tid);
    };
  }, [handleScroll]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          <span className="ml-2 text-sm text-gray-500">Loading older messages...</span>
        </div>
      )}
      {!isLoadingMore && sortedMessages.length > 0 && messagePagination.page <= messagePagination.totalPages && (
        <div className="flex justify-center py-2">
          <button
            onClick={() => onLoadMore(messagePagination.page + 1)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Load older messages
          </button>
        </div>
      )}

      {sortedMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-zinc-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        sortedMessages.map((msg) => (
          <div key={msg.message_id} className={`flex ${msg.sender._id === senderId ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender._id === senderId
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
              }`}
            >
              {msg.content?.trim() && <p>{msg.content}</p>}

              {msg.media?.url && (
                <div className="mt-2">
                  {msg.media?.type === "image" ? (
                    <div className="mb-2">
                      <img
                        src={`http://localhost:5000${msg.media.url}`}
                        alt={msg.media.originalName || "Image"}
                        className="max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                        onClick={() => window.open(`http://localhost:5000${msg.media?.url}`, "_blank")}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {msg.media.originalName || "File"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {msg.media.type || "File"}
                        </p>
                      </div>
                      <a
                        href={`http://localhost:5000${msg.media.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                        download={msg.media.type !== "application/pdf"}
                      >
                        {msg.media.type === "application/pdf" ? "View" : "Download"}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <span className="text-xs opacity-70 mt-1 block">
                {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ""}
              </span>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
