"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChatSidebar from "@/components/chat-sidebar"
import ChatWindow from "@/components/chat-window"
import { useWebSocket } from "@/hooks/use-websocket"

export interface Group {
  id: number
  name: string
  created_at: string
}

export interface Message {
  sender_id: number
  receiver_id?: number
  group_id?: number
  content: string
  created_at: string
}

export interface DirectMessage {
  sender_id: number
  receiver_id: number
  content: string
  created_at: string
}

export default function ChatPage() {
  const [token, setToken] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedChat, setSelectedChat] = useState<{ type: "group" | "direct"; id: number; name: string } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const router = useRouter()

  const { sendMessage, lastMessage } = useWebSocket(token)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      router.push("/")
      return
    }
    setToken(storedToken)
  }, [router])

  useEffect(() => {
    if (token) {
      fetchGroups()
    }
  }, [token])

  useEffect(() => {
    if (lastMessage) {
      setMessages((prev) => [...prev, lastMessage])
    }
  }, [lastMessage])

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:8080/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setGroups(data || [])
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    }
  }

  const fetchMessages = async (chatType: "group" | "direct", chatId: number) => {
    try {
      const url =
        chatType === "group"
          ? `http://localhost:8080/groups/${chatId}/messages`
          : `http://localhost:8080/users/${chatId}/messages`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data || [])
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const handleChatSelect = (chatType: "group" | "direct", chatId: number, chatName: string) => {
    setSelectedChat({ type: chatType, id: chatId, name: chatName })
    fetchMessages(chatType, chatId)
  }

  const handleSendMessage = (content: string) => {
    if (selectedChat && sendMessage) {
      if (selectedChat.type === "group") {
        sendMessage({
          group_id: selectedChat.id,
          content,
        })
      } else {
        sendMessage({
          to: selectedChat.id,
          content,
        })
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    router.push("/")
  }

  if (!token) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar
        groups={groups}
        onChatSelect={handleChatSelect}
        onCreateGroup={fetchGroups}
        onLogout={handleLogout}
        token={token}
      />
      <ChatWindow selectedChat={selectedChat} messages={messages} onSendMessage={handleSendMessage} />
    </div>
  )
}
