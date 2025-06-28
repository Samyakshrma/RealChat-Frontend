"use client"

import type React from "react"
import { jwtDecode } from "jwt-decode"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea , ScrollBar} from "@/components/ui/scroll-area"
import { Send, MessageCircle } from "lucide-react"
import type { Message } from "@/app/chat/page"

interface ChatWindowProps {
  selectedChat: { type: "group" | "direct"; id: number; name: string } | null
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  onSendMessage: (content: string) => void
}

export default function ChatWindow({ selectedChat, messages,setMessages, onSendMessage }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)


  // Decode user ID from token after mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded: { user_id: number } = jwtDecode(token)
        setCurrentUserId(decoded.user_id)
        localStorage.setItem("userId", decoded.user_id.toString())
      } catch (error) {
        console.error("Failed to decode token:", error)
      }
    }
  }, [])
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])




  const handleSendMessage = (e: React.FormEvent) => {
  e.preventDefault()
  if (newMessage.trim() && selectedChat && currentUserId !== null) {
    const messageToAdd: Message = {
      sender_id: currentUserId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(), // or new Date() depending on your type
    }

    onSendMessage(newMessage.trim()) // send via WebSocket
    setMessages((prev) => [...prev, messageToAdd]) // update UI immediately
    setNewMessage("")
  }
}

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
          <p className="text-gray-500">Choose a group or start a direct message to begin chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-lg">{selectedChat.name}</h2>
        <p className="text-sm text-gray-500">
          {selectedChat.type === "group" ? "Group Chat" : "Direct Message"}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = currentUserId !== null && message.sender_id === currentUserId
            return (
              <div key={index} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage ? "bg-green-500 text-white" : "bg-white border border-gray-200"
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-500 mb-1">User {message.sender_id}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? "text-green-100" : "text-gray-500"}`}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={scrollAnchorRef} />
        </div>
      </ScrollArea>


      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
