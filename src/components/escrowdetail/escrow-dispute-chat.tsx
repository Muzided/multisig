"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Paperclip, Send } from "lucide-react"
import { format } from "date-fns"
import { useWeb3 } from "@/context/Web3Context"

interface Message {
  id: string
  sender: string
  message: string
  timestamp: string
  attachments: string[]
}

interface EscrowDisputeChatProps {
  dispute: {
    status: string
    messages: Message[]
  }
}

export function EscrowDisputeChat({ dispute }: EscrowDisputeChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { account } = useWeb3()
  const add = "0x84F1C7E182B3C9bF0Df4Eb1C5a6fC112FCB7A23a"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleSendMessage = () => {
    // Handle sending message
    setNewMessage("")
    setSelectedFile(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant={dispute.status === "Resolved" ? "default" : "destructive"}>
          {dispute.status}
        </Badge>
      </div>

      <div className="space-y-4">
      {dispute.messages.map((message) => {
  const isCurrentUser = message.sender.toLowerCase() ===add.toLowerCase()
  return (
    <div
      key={message.id}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <Card
        className={`max-w-[75%] ${
          isCurrentUser
            ? 'bg-blue-100 dark:bg-blue-900/30 rounded-tr-none ml-auto'
            : 'bg-gray-100 dark:bg-zinc-800 rounded-tl-none mr-auto'
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {isCurrentUser ? "You" : message.sender.slice(0, 6) + "..." + message.sender.slice(-4)}
            </CardTitle>
            <span className="text-xs text-gray-500">
              {format(new Date(message.timestamp), "MMM d, h:mm a")}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{message.message}</p>
          {message.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Attachment {index + 1}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})}
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[100px]"
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
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button onClick={handleSendMessage}>
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