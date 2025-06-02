"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Paperclip, Send, ArrowLeft, MessageSquare, UserCircle2, ShieldCheck, LucideIcon } from "lucide-react"
import { format } from "date-fns"
import { useWeb3 } from "@/context/Web3Context"
import { startConversation } from "@/services/Api/chat/chat"
import { useSocketChat } from "@/Hooks/useSocketChat"
import { toast } from "react-toastify"

// Demo data for testing
const demoUsers = {
  creator: {
    address: "0x84F1C7E182B3C9bF0Df4Eb1C5a6fC112FCB7A23a",
    userId: "682301aaec33370cc0d01b8f",
    role: "Creator",
    name: "John Doe",
    avatar: UserCircle2
  },
  resolver: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    userId: "682301aaec33370cc0d01b8f",
    role: "Resolver",
    name: "Sarah Smith",
    avatar: ShieldCheck
  }
}

const demoMessages: Message[] = [
 
  
]

interface Message {
  conversationId: string;
  message: string;
  senderId: string;
  timestamp?: string;
}

interface User {
  address: string;
  role: string;
  name: string;
  userId: string;
  avatar: LucideIcon;
}

interface EscrowDisputeChatProps {
  dispute: {
    status: string
    messages: Message[]
  }
}

// User List Component
const UserList = ({ users, onSelectUser }: { users: User[], onSelectUser: (user: User) => void }) => {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Card
          key={user.address}
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => onSelectUser(user)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                <user.avatar className="h-6 w-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{user.address}</h3>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Chat View Component
const ChatView = ({
  user,
  messages: initialMessages,
  onBack,
  onSendMessage
}: {
  user: User,
  messages: Message[],
  onBack: () => void,
  onSendMessage: (message: string) => void
}) => {
  const [newMessage, setNewMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const add = "0x84F1C7E182B3C9bF0Df4Eb1C5a6fC112FCB7A23a"

  // Initialize socket chat
  const { 
    sendMessage: socketSendMessage, 
    isConnected, 
    messages: socketMessages, 
    error: socketError 
  } = useSocketChat({
    conversationId: conversationId || '',
    senderId: "682301aaec33370cc0d01b8f",
    onMessageReceived: (message) => {
      // Handle new message received
      console.log('New message received:', message);
    },
  });

  const triggerConversation = async () => {
    try {
      const conversationResponse = await startConversation(user.userId)

      if (conversationResponse.status === 200 || conversationResponse.status === 201) {
        setConversationId(conversationResponse.data._id)
      }
    } catch (error) {
      console.log("error while triggering conversation", error)
    }
  }

  useEffect(() => {
    if (!user) return
    triggerConversation();
  }, [user])

  // Show connection status
  useEffect(() => {
    if (socketError) {
      toast.error(socketError);
    }
  }, [socketError]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversationId) return;
    
    // Send message through socket
    socketSendMessage(newMessage);
    
    // Also call the original onSendMessage for any additional handling
    onSendMessage(newMessage);
    
    setNewMessage("");
    setSelectedFile(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  // Combine initial messages with socket messages
  const allMessages = [...initialMessages, ...socketMessages];

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
          <user.avatar className="h-6 w-6 text-gray-500" />
        </div>
        <div>
          <h3 className="font-medium">{user.address}</h3>
          <p className="text-sm text-gray-500">{user.role}</p>
        </div>
        {/* Connection Status */}
        <div className="ml-auto">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((message, index) => {
          const isCurrentUser = message.senderId.toLowerCase() === add.toLowerCase()
          return (
            <div
              key={message.timestamp || index}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[75%] ${isCurrentUser
                  ? 'bg-blue-100 dark:bg-blue-900/30 rounded-tr-none ml-auto'
                  : 'bg-gray-100 dark:bg-zinc-800 rounded-tl-none mr-auto'
                }`}
              >
                <CardContent>
                  <p className="text-sm whitespace-pre-line">{message.message}</p>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder={`Type your message to ${user.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[60px]"
              disabled={!isConnected || !conversationId}
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm">
                <Paperclip className="h-4 w-4" />
                <span>{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={!isConnected || !conversationId}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected || !conversationId}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

export function EscrowDisputeChat() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const dispute = {
    status: "Active",
    messages: demoMessages
  }

  const handleSendMessage = (message: string) => {
    // Handle sending message
    console.log("Sending message to", selectedUser?.name, ":", message)
  }

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      {selectedUser ? (
        <ChatView
          user={selectedUser}
          messages={dispute.messages}
          onBack={() => setSelectedUser(null)}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dispute Chat</h2>
            <Badge variant={dispute.status === "Resolved" ? "default" : "destructive"}>
              {dispute.status}
            </Badge>
          </div>
          <UserList
            users={Object.values(demoUsers)}
            onSelectUser={setSelectedUser}
          />
        </div>
      )}
    </div>
  )
} 