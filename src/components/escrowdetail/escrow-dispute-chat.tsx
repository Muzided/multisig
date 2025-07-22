"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Paperclip, Send, ArrowLeft, MessageSquare, UserCircle2, ShieldCheck, LucideIcon, X } from "lucide-react"
import { format } from "date-fns"
import { useWeb3 } from "@/context/Web3Context"
import { getConversationDetails, getChatMessages, startConversation, uploadMediatoChat } from "@/services/Api/chat/chat"
import { useSocketChat } from "@/Hooks/useSocketChat"
import { toast } from "react-toastify"
import { getEscrowDetailsResponse, Resolver } from "@/types/escrow"
import { useUser } from "@/context/userContext"
import { ChatDetailsResponse, ChatMessage, ChatPagination, ChatResponse, ConversationDetailsResponse, Media, startConversationRequest } from "@/types/chat"
import { User } from "@/types/user"
import { formatAddress } from "../../../utils/helper"


interface Message {
  conversationId: string;
  message: string;
  senderId: string;
  timestamp?: string;
}


// User List Component
const UserList = ({ user, onSelectUser }: { user: Resolver, onSelectUser: (user: Resolver) => void }) => {
  return (
    <div className="space-y-2">

      <Card
        key={user._id}
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
        onClick={() => onSelectUser(user)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex-1">
            <h3 className="font-medium hidden md:block">{user.wallet_address}</h3>
              <h3 className="font-medium md:hidden">{formatAddress(user.wallet_address)}</h3>
              <p className="text-sm text-gray-500">{"Resolver"}</p>
            </div>
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>

    </div>
  )
}


const MessageList = React.memo(({
  messages,
  senderId,
  onLoadMore,
  isLoadingMore,
  conversationId,
  messagePagination
}: {
  messages: ChatMessage[],
  senderId: string,
  onLoadMore: (pagination: number) => Promise<void>,
  messagePagination: ChatPagination
  isLoadingMore: boolean,
  conversationId: string
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [prevScrollHeight, setPrevScrollHeight] = useState(0)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)

  // Sort messages by sentAt timestamp
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) =>
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  }, [messages]);

  // Handle scroll to bottom for new messages
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sortedMessages, shouldScrollToBottom]);

  // Maintain scroll position when loading older messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && prevScrollHeight > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeight;
      container.scrollTop = container.scrollTop + scrollDiff;
      setPrevScrollHeight(0); // Reset
    }
  }, [sortedMessages, prevScrollHeight]);

  // Handle scroll to load more messages
  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || messagePagination.page === messagePagination.totalPages) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Check if user is near bottom (within 100px) to enable auto-scroll for new messages
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isNearBottom);

    // Check if we're near the top (within 100px) to load more messages
    if (scrollTop < 100) {
    

      try {
        // Store current scroll height before loading
        setPrevScrollHeight(scrollHeight);
        await onLoadMore(messagePagination.page + 1);
      } catch (error) {
        console.error('Error loading more messages:', error);
        setPrevScrollHeight(0); // Reset on error
      }
    }
  }, [conversationId, isLoadingMore, onLoadMore, messagePagination]);

  // Add scroll event listener with throttling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100); // Throttle to 100ms
    };

    container.addEventListener('scroll', throttledHandleScroll);
    return () => {
      container.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
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
      ) 
      :
      (
        sortedMessages.map((msg) => (
          <div
            key={msg.message_id}
            className={`flex ${msg.sender._id === senderId
              ? "justify-end"
              : "justify-start"
              }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${msg.sender._id === senderId
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                }`}
            >
              {/* Show message content only if it's not empty */}
              {msg.content && msg.content.trim() !== "" && (
                <p>{msg.content}</p>
              )}
              
              {/* Show media if it exists */}
              {msg.media?.url && (
                <div className="mt-2">
                  {/* Show image preview for image types */}
                  
                  {msg.media?.type==='image' ? (
                    <div className="mb-2">
                      <img 
                        src={`http://localhost:5000${msg?.media?.url}`}
                        alt={msg.media.originalName || 'Image'}
                        className="max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                        onClick={() => window.open(`http://localhost:5000${msg?.media?.url}`, '_blank')}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {msg.media.originalName || 'File'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {msg.media.type || 'File'}
                        </p>
                      </div>
                      <a 
                        href={`http://localhost:5000${msg.media.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                        download={msg.media.type !== 'application/pdf'}
                      >
                        {msg.media.type === 'application/pdf' ? 'View' : 'Download'}
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <span className="text-xs opacity-70 mt-1 block">
                {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ''}
              </span>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
})


// Chat View Component
const ChatView = ({
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
  messagePagination: ChatPagination
  onBack: () => void,
  loading: boolean,
  onLoadMore: (conversationId: string, page: number) => Promise<boolean>
}) => {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  const [media,setMedia] = useState<Media| null>(null)
  const senderId = sender?.id || ""
  const conversationId = chatDetails?.conversationId || ""

  const handleMessageReceived = useCallback((message: ChatMessage) => {
console.log("message received",message,allMessages)
    // Add the new message to allMessages array, avoiding duplicates
    setAllMessages(prev => {
      const exists = prev.some(msg => msg.message_id === message.message_id)
      if (exists) return prev
      return [...prev, message]
    })
  }, [])

  
  // Initialize socket chat
  const {
    sendMessage: socketSendMessage,
    isConnected,
    messages: socketMessages,
    error: socketError
  } = useSocketChat({
    conversationId: conversationId,
    senderId: senderId,
    onMessageReceived: handleMessageReceived,
  });

  // Handle scroll to load more messages
  const handleScroll = async (pagination: number) => {
    console.log("message-pagination", messagePagination, pagination)
    if (messagePagination.page >= messagePagination.totalPages) {
      setIsLoadingMore(false);
      return;
    }

    setIsLoadingMore(true);
    try {
      await onLoadMore(conversationId, pagination);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }
  console.log("chatMessages", chatMessages)
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0) {
      setAllMessages(chatMessages)
    }

  }, [chatMessages])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4">
          {/* Message skeleton */}
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          {/* Repeat skeleton a few times */}
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && conversationId) {
      try {
        const response = await uploadMediatoChat(file)
        if (response.status === 200) {
          setMedia(response.data.media)
          toast.success("File uploaded successfully")
        } else {
          toast.error("Failed to upload file")
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        toast.error("Failed to upload file")
      }
    }
    // Reset the input
    event.target.value = ''
  }

  const handleRemoveMedia = () => {
    setMedia(null)
  }
console.log("Media gloabl",media)
  const handleSendMessage = () => {
    if ((!message.trim() && !media) || !conversationId) return;
    
    // Send message with media if available
    if (media && message) {
      console.log("media-being-sent",media)
      // You can modify this to send both text and media
      socketSendMessage(message,media);
      // socketSendMessage(message, media) // If your socket supports media
    } else if(media && !message) {
      console.log("message", message)
      socketSendMessage('',media);
    }else if (message && !media){
      socketSendMessage(message,null);
    }
    
    setMessage("");
    setMedia(null); // Clear media after sending
  }
console.log("media",media)
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
          <p className="text-sm text-gray-500">{"Resolver"}</p>
        </div>
        {/* Connection Status */}
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
        isLoadingMore={isLoadingMore}
        conversationId={conversationId}
        messagePagination={messagePagination}
      />

      {/* Message Input */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
        {/* Media Preview */}
        {media && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                  <Paperclip className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {media.originalName || 'Uploaded file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {media.type || 'File uploaded'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveMedia}
                className="h-8 w-8 text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={media ? "Add a message (optional)..." : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <label className="cursor-pointer">
            <>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,image/*,application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain,.md,text/markdown,.csv,text/csv,.html,text/html,.htm,.xml,text/xml,application/rtf,.rtf,application/json,.json,application/xml,application/x-apple-pages,application/x-iwork-pages-sffpages"
              />
              <Button asChild variant="outline" size="icon">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Paperclip className="w-4 h-4" />
                </label>
              </Button>
            </>
          </label>
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || (!message.trim() && !media)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


export function EscrowDisputeChat({ escrowDetails }: { escrowDetails: getEscrowDetailsResponse }) {
  const [selectedUser, setSelectedUser] = useState<Resolver | null>(null)
  const [chatDetails, setChatDetails] = useState<ConversationDetailsResponse | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagePagination, setMessagePagination] = useState<ChatPagination>({
    total: 0,
    page: 1,
    limit: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const handleSelectUser = async (user: Resolver) => {

    setSelectedUser(user)
    initializeConversation()

  }
  
  const initializeConversation = async () => {
    if (!escrowDetails?.resolver?.dispute_contract_address && chatDetails?.conversationId) return;
    console.log("yoo!!")
    try {
      setLoading(true)
      // First, try to get conversation details
      const response = await getConversationDetails(escrowDetails.resolver.dispute_contract_address)

      if (response.status === 200 && response.data && response.data.conversationId) {
        // If conversation exists, fetch its messages
        setChatDetails(response.data)
        const messagesResponse = await getChatMessages(response.data.conversationId)
        if (messagesResponse.status === 200 && messagesResponse.data) {
          setMessages(messagesResponse.data.messages)
          setMessagePagination(messagesResponse.data.pagination)
        }
      } else {
        // If no conversation exists, start a new one
        const startConvoRequest: startConversationRequest = {
          disputeContractAddress: escrowDetails.resolver.dispute_contract_address,
          target_walletaddress: escrowDetails.resolver.wallet_address
        }
        const newConvoResponse = await startConversation(startConvoRequest)

        if (newConvoResponse.status === 201 || newConvoResponse.status === 200) {
          setChatDetails({
            conversationId: newConvoResponse.data._id,
            disputeId: "",
            success: true,
            userRole: ""
          }
          )
        }
      }
    } catch (error) {
      console.log("error while handling conversation:", error)
      toast.error("Failed to load conversation")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    initializeConversation()
  }, [escrowDetails?.resolver?.dispute_contract_address, escrowDetails?.resolver?.wallet_address])
  const handleLoadMoreMessages = async (conversationId: string, page: number) => {
    console.log("pagiated-numbers", page)
    try {
      const response = await getChatMessages(conversationId, page)
      if (response.status === 200 && response.data) {
        console.log("fullon-paginations", response.data.pagination)
        // Update pagination first
        setMessagePagination(prev => ({
          ...response.data.pagination,
          page: page // Ensure we're using the correct page number
        }))

        // Create a Map of existing messages using message_id as key
        const existingMessages = new Map(messages.map(msg => [msg.message_id, msg]))

        // Add new messages, avoiding duplicates
        response.data.messages.forEach(msg => {
          if (!existingMessages.has(msg.message_id)) {
            existingMessages.set(msg.message_id, msg)
          }
        })

        // Convert back to array and sort by timestamp
        const updatedMessages = Array.from(existingMessages.values())
          .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())

        setMessages(updatedMessages)
        return response.data.messages.length > 0
      }
      return false
    } catch (error) {
      console.error('Error loading more messages:', error)
      toast.error('Failed to load more messages')
      return false
    }
  }

  const handleBack = () => {
    setSelectedUser(null)
    setMessagePagination({
      total: 0,
      page: 0,
      limit: 0,
      totalPages: 0
    })
    setLoading(true)
    setMessages([])
  }



  if (!selectedUser) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select a user to start chatting</h2>
        <UserList
          user={escrowDetails.resolver}
          onSelectUser={handleSelectUser}
        />
      </div>
    )
  }
  console.log("chatDetails", chatDetails)
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
  )
} 