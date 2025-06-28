"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MessageCircle, Users, Plus, LogOut, User } from "lucide-react"
import type { Group } from "@/app/chat/page"

interface ChatSidebarProps {
  groups: Group[]
  onChatSelect: (type: "group" | "direct", id: number, name: string) => void
  onCreateGroup: () => void
  onLogout: () => void
  token: string
}

export default function ChatSidebar({ groups, onChatSelect, onCreateGroup, onLogout, token }: ChatSidebarProps) {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [memberIds, setMemberIds] = useState("")
  const [loading, setLoading] = useState(false)
  const [directChatUserId, setDirectChatUserId] = useState("")

  const username = localStorage.getItem("username") || "User"

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return

    setLoading(true)
    try {
      const memberIdArray = memberIds
        .split(",")
        .map((id) => Number.parseInt(id.trim()))
        .filter((id) => !isNaN(id))

      const response = await fetch("http://localhost:8080/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          member_ids: memberIdArray,
        }),
      })

      if (response.ok) {
        setGroupName("")
        setMemberIds("")
        setIsCreateGroupOpen(false)
        onCreateGroup()
      }
    } catch (error) {
      console.error("Failed to create group:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectChat = () => {
    const userId = Number.parseInt(directChatUserId)
    if (!isNaN(userId)) {
      onChatSelect("direct", userId, `User ${userId}`)
      setDirectChatUserId("")
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-green-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6" />
            <span className="font-semibold">ChatApp</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-white hover:bg-green-700">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-green-100 mt-1">Welcome, {username}</p>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2 border-b border-gray-200">
        <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Label htmlFor="member-ids">Member IDs (comma-separated)</Label>
                <Input
                  id="member-ids"
                  value={memberIds}
                  onChange={(e) => setMemberIds(e.target.value)}
                  placeholder="e.g., 2, 3, 4"
                />
              </div>
              <Button onClick={handleCreateGroup} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex space-x-2">
          <Input
            placeholder="User ID for direct chat"
            value={directChatUserId}
            onChange={(e) => setDirectChatUserId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleDirectChat} size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Groups</h3>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1">
            {groups.map((group) => (
              <Button
                key={group.id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
                onClick={() => onChatSelect("group", group.id, group.name)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-xs text-gray-500">Created {new Date(group.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
