"use client"

import { useEffect, useRef, useState } from "react"

interface WebSocketMessage {
  to?: number
  group_id?: number
  content: string
}

interface ReceivedMessage {
  sender_id: number
  receiver_id?: number
  group_id?: number
  content: string
  created_at: string
}

export function useWebSocket(token: string | null) {
  const ws = useRef<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<ReceivedMessage | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"Connecting" | "Open" | "Closed">("Closed")

  useEffect(() => {
    if (!token) return

    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket(`ws://localhost:8080/chat?token=${token}`)

        ws.current.onopen = () => {
          setConnectionStatus("Open")
          console.log("WebSocket connected")
        }

        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            setLastMessage({
              ...message,
              created_at: new Date().toISOString(),
            })
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error)
          }
        }

        ws.current.onclose = () => {
          setConnectionStatus("Closed")
          console.log("WebSocket disconnected")
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error)
        }
      } catch (error) {
        console.error("Failed to connect WebSocket:", error)
        setTimeout(connectWebSocket, 3000)
      }
    }

    connectWebSocket()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [token])

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.error("WebSocket is not connected")
    }
  }

  return {
    sendMessage,
    lastMessage,
    connectionStatus,
  }
}
